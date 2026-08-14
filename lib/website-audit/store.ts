import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  BlobPreconditionFailedError,
  get,
  put,
} from "@vercel/blob";
import {
  auditStatuses,
  reportRequestStatuses,
} from "./store-types";
import { getWebsiteAuditBlobAuthOptions } from "./blob-config";
import type {
  AuditFailure,
  AuditReportStore,
  AuditReportStoreOptions,
  AuditResultWriteReceipt,
  AuditState,
  AuditStateTransition,
  AuditStatus,
  CreateAuditStateInput,
  ReportRequestReceipt,
  StoredAuditResult,
  StoredAuditState,
  StoredReportRequestReceipt,
  TransitionAuditStateOptions,
  WriteReportRequestReceiptInput,
} from "./store-types";

export * from "./store-types";

const auditIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const blobPrefix = "website-audits";
const jsonContentType = "application/json; charset=utf-8";
const maxStateBytes = 64 * 1024;
const maxResultBytes = 1024 * 1024;
const maxReceiptBytes = 64 * 1024;

const allowedTransitions: Readonly<Record<AuditStatus, readonly AuditStatus[]>> = {
  queued: ["running", "failed"],
  running: ["queued", "completed", "failed"],
  completed: [],
  failed: [],
};

export class InvalidAuditIdError extends Error {
  readonly code = "INVALID_AUDIT_ID";

  constructor() {
    super("The audit ID is invalid.");
    this.name = "InvalidAuditIdError";
  }
}

export class AuditStateNotFoundError extends Error {
  readonly code = "AUDIT_STATE_NOT_FOUND";

  constructor() {
    super("The audit state could not be found.");
    this.name = "AuditStateNotFoundError";
  }
}

export class AuditStateTransitionError extends Error {
  readonly code = "INVALID_AUDIT_STATE_TRANSITION";

  constructor(from: AuditStatus, to: AuditStatus) {
    super(`The audit cannot transition from ${from} to ${to}.`);
    this.name = "AuditStateTransitionError";
  }
}

export class AuditStorageConflictError extends Error {
  readonly code = "AUDIT_STORAGE_CONFLICT";

  constructor(message = "The audit record changed before it could be saved.") {
    super(message);
    this.name = "AuditStorageConflictError";
  }
}

export class AuditStorageValidationError extends Error {
  readonly code = "AUDIT_STORAGE_VALIDATION_ERROR";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AuditStorageValidationError";
  }
}

export class AuditStorageUnavailableError extends Error {
  readonly code = "AUDIT_STORAGE_UNAVAILABLE";

  constructor(options?: ErrorOptions) {
    super("Audit storage is temporarily unavailable.", options);
    this.name = "AuditStorageUnavailableError";
  }
}

type StoredJson = Readonly<{
  serialized: string;
  etag: string;
}>;

type StoreBackend =
  | Readonly<{ kind: "blob" }>
  | Readonly<{ kind: "local"; rootDirectory: string }>;

export const generateAuditId = () => randomUUID();

export const isValidAuditId = (value: string): boolean =>
  auditIdPattern.test(value);

const assertValidAuditId = (value: string) => {
  if (!isValidAuditId(value)) {
    throw new InvalidAuditIdError();
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown, maxLength = Number.POSITIVE_INFINITY) =>
  typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;

const isOptionalString = (value: unknown, maxLength: number) =>
  value === undefined || isNonEmptyString(value, maxLength);

const isIsoDate = (value: unknown) =>
  typeof value === "string" && Number.isFinite(Date.parse(value));

const isAuditStatus = (value: unknown): value is AuditStatus =>
  typeof value === "string" &&
  (auditStatuses as readonly string[]).includes(value);

const isAuditFailure = (value: unknown): value is AuditFailure =>
  isRecord(value) &&
  isNonEmptyString(value.code, 80) &&
  isNonEmptyString(value.message, 500) &&
  typeof value.retryable === "boolean";

const parseAuditState = (value: unknown, expectedId: string): AuditState => {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    value.id !== expectedId ||
    !isValidAuditId(expectedId) ||
    !isAuditStatus(value.status) ||
    !isNonEmptyString(value.submittedUrl, 2048) ||
    !isOptionalString(value.normalizedUrl, 2048) ||
    !isOptionalString(value.finalUrl, 2048) ||
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.updatedAt) ||
    (value.startedAt !== undefined && !isIsoDate(value.startedAt)) ||
    (value.completedAt !== undefined && !isIsoDate(value.completedAt)) ||
    (value.failedAt !== undefined && !isIsoDate(value.failedAt)) ||
    (value.failure !== undefined && !isAuditFailure(value.failure)) ||
    typeof value.runAttempts !== "number" ||
    !Number.isSafeInteger(value.runAttempts) ||
    value.runAttempts < 0 ||
    value.runAttempts > 10
  ) {
    throw new AuditStorageValidationError(
      "The stored audit state is invalid.",
    );
  }

  if (value.status === "failed" && !isAuditFailure(value.failure)) {
    throw new AuditStorageValidationError(
      "The stored failed audit is missing a failure reason.",
    );
  }

  return value as AuditState;
};

const serializeJson = (value: unknown, maxBytes: number): string => {
  let json: string | undefined;

  try {
    json = JSON.stringify(value);
  } catch (error) {
    throw new AuditStorageValidationError(
      "The audit record is not JSON serializable.",
      { cause: error },
    );
  }

  if (json === undefined) {
    throw new AuditStorageValidationError(
      "The audit record is not JSON serializable.",
    );
  }

  const serialized = `${json}\n`;

  if (Buffer.byteLength(serialized) > maxBytes) {
    throw new AuditStorageValidationError(
      "The audit record exceeds the storage size limit.",
    );
  }

  return serialized;
};

const parseJson = (serialized: string): unknown => {
  try {
    return JSON.parse(serialized) as unknown;
  } catch (error) {
    throw new AuditStorageValidationError(
      "The stored audit record is not valid JSON.",
      { cause: error },
    );
  }
};

const getEtag = (serialized: string) =>
  createHash("sha256").update(serialized).digest("hex");

const requireBlobAuthOptions = () => {
  const authOptions = getWebsiteAuditBlobAuthOptions();

  if (!authOptions) {
    throw new AuditStorageUnavailableError();
  }

  return authOptions;
};

const getStatePath = (auditId: string) => `${auditId}/state.json`;
const getResultPath = (auditId: string) => `${auditId}/result.json`;
const getReceiptPath = (auditId: string, requestId: string) =>
  `${auditId}/report-requests/${requestId}.json`;
const getBlobPath = (relativePath: string) => `${blobPrefix}/${relativePath}`;

const isNodeError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error && "code" in error;

const toStorageError = (error: unknown): Error => {
  if (
    error instanceof AuditStorageUnavailableError ||
    error instanceof AuditStorageConflictError ||
    error instanceof AuditStorageValidationError ||
    error instanceof InvalidAuditIdError ||
    error instanceof AuditStateNotFoundError ||
    error instanceof AuditStateTransitionError
  ) {
    return error;
  }

  if (error instanceof BlobPreconditionFailedError) {
    return new AuditStorageConflictError();
  }

  return new AuditStorageUnavailableError({ cause: error });
};

const readBlobJson = async (relativePath: string): Promise<StoredJson | null> => {
  try {
    const result = await get(getBlobPath(relativePath), {
      access: "private",
      ...requireBlobAuthOptions(),
      useCache: false,
    });

    if (!result) {
      return null;
    }

    if (result.statusCode !== 200) {
      throw new AuditStorageUnavailableError();
    }

    return {
      serialized: await new Response(result.stream).text(),
      etag: result.blob.etag,
    };
  } catch (error) {
    throw toStorageError(error);
  }
};

const writeBlobJson = async (
  relativePath: string,
  serialized: string,
  options: Readonly<{ expectedEtag?: string; immutable?: boolean }> = {},
): Promise<string> => {
  try {
    const result = await put(
      getBlobPath(relativePath),
      Buffer.from(serialized),
      {
        access: "private",
        ...requireBlobAuthOptions(),
        addRandomSuffix: false,
        allowOverwrite: options.immutable ? false : true,
        cacheControlMaxAge: options.immutable ? 31_536_000 : 60,
        contentType: jsonContentType,
        ifMatch: options.expectedEtag,
      },
    );

    return result.etag;
  } catch (error) {
    throw toStorageError(error);
  }
};

const readLocalJson = async (
  rootDirectory: string,
  relativePath: string,
): Promise<StoredJson | null> => {
  const filePath = path.join(rootDirectory, relativePath);

  try {
    const serialized = await readFile(filePath, "utf8");
    return { serialized, etag: getEtag(serialized) };
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return null;
    }

    throw toStorageError(error);
  }
};

const writeLocalJson = async (
  rootDirectory: string,
  relativePath: string,
  serialized: string,
  options: Readonly<{ expectedEtag?: string; immutable?: boolean }> = {},
): Promise<string> => {
  const filePath = path.join(rootDirectory, relativePath);

  try {
    await mkdir(path.dirname(filePath), { recursive: true });

    if (options.immutable) {
      await writeFile(filePath, serialized, { encoding: "utf8", flag: "wx" });
      return getEtag(serialized);
    }

    if (options.expectedEtag) {
      const current = await readLocalJson(rootDirectory, relativePath);

      if (!current || current.etag !== options.expectedEtag) {
        throw new AuditStorageConflictError();
      }
    }

    const temporaryPath = `${filePath}.${randomUUID()}.tmp`;

    try {
      await writeFile(temporaryPath, serialized, {
        encoding: "utf8",
        flag: "wx",
      });
      await rename(temporaryPath, filePath);
    } catch (error) {
      await unlink(temporaryPath).catch(() => undefined);
      throw error;
    }

    return getEtag(serialized);
  } catch (error) {
    if (isNodeError(error) && error.code === "EEXIST") {
      throw new AuditStorageConflictError("The audit record already exists.");
    }

    throw toStorageError(error);
  }
};

const getBackend = (options: AuditReportStoreOptions): StoreBackend => {
  if (process.env.NODE_ENV === "production") {
    return { kind: "blob" };
  }

  return {
    kind: "local",
    rootDirectory: path.resolve(
      options.localDirectory ??
        path.join(process.cwd(), ".next", "website-audits"),
    ),
  };
};

const getNow = (now: () => Date): string => {
  const date = now();

  if (!Number.isFinite(date.getTime())) {
    throw new AuditStorageValidationError(
      "The audit timestamp could not be created.",
    );
  }

  return date.toISOString();
};

const validateUrlField = (value: string, fieldName: string) => {
  if (!isNonEmptyString(value, 2048)) {
    throw new AuditStorageValidationError(
      `${fieldName} must be a non-empty string no longer than 2048 characters.`,
    );
  }
};

const validateFailure = (failure: AuditFailure | undefined) => {
  if (!isAuditFailure(failure)) {
    throw new AuditStorageValidationError(
      "A failed audit requires a safe failure reason.",
    );
  }
};

export const createAuditReportStore = (
  options: AuditReportStoreOptions = {},
): AuditReportStore => {
  const backend = getBackend(options);
  const now = options.now ?? (() => new Date());
  const retentionDays =
    options.retentionDays ??
    Number(process.env.WEBSITE_AUDIT_RETENTION_DAYS || 30);

  if (
    !Number.isSafeInteger(retentionDays) ||
    retentionDays <= 0 ||
    retentionDays > 90
  ) {
    throw new AuditStorageValidationError(
      "Audit retention must be between 1 and 90 days.",
    );
  }

  const readJson = (relativePath: string) =>
    backend.kind === "blob"
      ? readBlobJson(relativePath)
      : readLocalJson(backend.rootDirectory, relativePath);

  const writeJson = (
    relativePath: string,
    serialized: string,
    writeOptions?: Readonly<{
      expectedEtag?: string;
      immutable?: boolean;
    }>,
  ) =>
    backend.kind === "blob"
      ? writeBlobJson(relativePath, serialized, writeOptions)
      : writeLocalJson(
          backend.rootDirectory,
          relativePath,
          serialized,
          writeOptions,
        );

  const readState = async (auditId: string): Promise<StoredAuditState | null> => {
    assertValidAuditId(auditId);
    const stored = await readJson(getStatePath(auditId));

    if (!stored) {
      return null;
    }

    const state = parseAuditState(parseJson(stored.serialized), auditId);
    const expiresAt =
      Date.parse(state.createdAt) + retentionDays * 24 * 60 * 60 * 1_000;

    if (now().getTime() >= expiresAt) {
      return null;
    }

    return {
      state,
      etag: stored.etag,
    };
  };

  const createState = async (
    input: CreateAuditStateInput,
  ): Promise<StoredAuditState> => {
    const id = input.id ?? generateAuditId();
    assertValidAuditId(id);
    validateUrlField(input.submittedUrl, "submittedUrl");

    if (input.normalizedUrl !== undefined) {
      validateUrlField(input.normalizedUrl, "normalizedUrl");
    }

    const timestamp = getNow(now);
    const state: AuditState = {
      schemaVersion: 1,
      id,
      status: "queued",
      submittedUrl: input.submittedUrl,
      normalizedUrl: input.normalizedUrl,
      createdAt: timestamp,
      updatedAt: timestamp,
      runAttempts: 0,
    };
    const serialized = serializeJson(state, maxStateBytes);
    const etag = await writeJson(getStatePath(id), serialized, {
      immutable: true,
    });

    return { state, etag };
  };

  const transitionState = async (
    auditId: string,
    transition: AuditStateTransition,
    transitionOptions: TransitionAuditStateOptions = {},
  ): Promise<StoredAuditState> => {
    assertValidAuditId(auditId);

    if (!isAuditStatus(transition.status)) {
      throw new AuditStorageValidationError(
        "The requested audit status is invalid.",
      );
    }

    const current = await readState(auditId);

    if (!current) {
      throw new AuditStateNotFoundError();
    }

    if (
      transitionOptions.expectedEtag &&
      transitionOptions.expectedEtag !== current.etag
    ) {
      throw new AuditStorageConflictError();
    }

    if (!allowedTransitions[current.state.status].includes(transition.status)) {
      throw new AuditStateTransitionError(
        current.state.status,
        transition.status,
      );
    }

    if (transition.normalizedUrl !== undefined) {
      validateUrlField(transition.normalizedUrl, "normalizedUrl");
    }

    if (transition.finalUrl !== undefined) {
      validateUrlField(transition.finalUrl, "finalUrl");
    }

    if (transition.status === "failed") {
      validateFailure(transition.failure);
    } else if (transition.failure !== undefined) {
      throw new AuditStorageValidationError(
        "Only a failed audit can include a failure reason.",
      );
    }

    const timestamp = getNow(now);
    const state: AuditState = {
      ...current.state,
      status: transition.status,
      normalizedUrl:
        transition.normalizedUrl ?? current.state.normalizedUrl,
      finalUrl: transition.finalUrl ?? current.state.finalUrl,
      updatedAt: timestamp,
      runAttempts:
        transition.status === "running"
          ? current.state.runAttempts + 1
          : current.state.runAttempts,
      startedAt:
        transition.status === "running"
          ? current.state.startedAt ?? timestamp
          : transition.status === "queued"
            ? undefined
            : current.state.startedAt,
      completedAt:
        transition.status === "completed"
          ? timestamp
          : current.state.completedAt,
      failedAt:
        transition.status === "failed" ? timestamp : current.state.failedAt,
      failure:
        transition.status === "failed" ? transition.failure : undefined,
    };
    const serialized = serializeJson(state, maxStateBytes);
    const etag = await writeJson(getStatePath(auditId), serialized, {
      expectedEtag: current.etag,
    });

    return { state, etag };
  };

  const writeResult = async (
    auditId: string,
    result: unknown,
  ): Promise<AuditResultWriteReceipt> => {
    assertValidAuditId(auditId);

    if (!(await readState(auditId))) {
      throw new AuditStateNotFoundError();
    }

    const serialized = serializeJson(result, maxResultBytes);
    const etag = await writeJson(getResultPath(auditId), serialized, {
      immutable: true,
    });

    return { auditId, etag };
  };

  const readResult = async <T = unknown>(
    auditId: string,
    parse?: (value: unknown) => T,
  ): Promise<StoredAuditResult<T> | null> => {
    assertValidAuditId(auditId);
    const stored = await readJson(getResultPath(auditId));

    if (!stored) {
      return null;
    }

    const value = parseJson(stored.serialized);
    let result: T;

    try {
      result = parse ? parse(value) : (value as T);
    } catch (error) {
      throw new AuditStorageValidationError(
        "The stored audit result failed validation.",
        { cause: error },
      );
    }

    return { auditId, result, etag: stored.etag };
  };

  const writeReportRequestReceipt = async (
    input: WriteReportRequestReceiptInput,
  ): Promise<StoredReportRequestReceipt> => {
    assertValidAuditId(input.auditId);
    const requestId = input.requestId ?? generateAuditId();
    assertValidAuditId(requestId);

    const storedState = await readState(input.auditId);

    if (!storedState) {
      throw new AuditStateNotFoundError();
    }

    if (storedState.state.status !== "completed") {
      throw new AuditStorageValidationError(
        "Report requests can only be stored for completed audits.",
      );
    }

    if (!/^[a-f0-9]{64}$/.test(input.recipientHash)) {
      throw new AuditStorageValidationError(
        "The report recipient hash is invalid.",
      );
    }

    if (!(reportRequestStatuses as readonly string[]).includes(input.status)) {
      throw new AuditStorageValidationError(
        "The report request status is invalid.",
      );
    }

    if (!isOptionalString(input.providerMessageId, 256)) {
      throw new AuditStorageValidationError(
        "The report provider message ID is invalid.",
      );
    }

    const receipt: ReportRequestReceipt = {
      schemaVersion: 2,
      id: requestId,
      auditId: input.auditId,
      recipientHash: input.recipientHash,
      status: input.status,
      requestedAt: getNow(now),
      providerMessageId: input.providerMessageId,
    };
    const serialized = serializeJson(receipt, maxReceiptBytes);
    const etag = await writeJson(
      getReceiptPath(input.auditId, requestId),
      serialized,
      { immutable: true },
    );

    return { receipt, etag };
  };

  return {
    createState,
    readState,
    transitionState,
    writeResult,
    readResult,
    writeReportRequestReceipt,
  };
};

export const auditReportStore = createAuditReportStore();

export const createAuditState = auditReportStore.createState;
export const readAuditState = auditReportStore.readState;
export const transitionAuditState = auditReportStore.transitionState;
export const writeAuditResult = auditReportStore.writeResult;
export const readAuditResult = auditReportStore.readResult;
export const writeReportRequestReceipt =
  auditReportStore.writeReportRequestReceipt;
