export const auditStatuses = [
  "queued",
  "running",
  "completed",
  "failed",
] as const;

export type AuditStatus = (typeof auditStatuses)[number];

export type AuditFailure = Readonly<{
  code: string;
  message: string;
  retryable: boolean;
}>;

export type AuditState = Readonly<{
  schemaVersion: 1;
  id: string;
  status: AuditStatus;
  submittedUrl: string;
  normalizedUrl?: string;
  finalUrl?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  failure?: AuditFailure;
}>;

export type StoredAuditState = Readonly<{
  state: AuditState;
  etag: string;
}>;

export type CreateAuditStateInput = Readonly<{
  id?: string;
  submittedUrl: string;
  normalizedUrl?: string;
}>;

export type AuditStateTransition = Readonly<{
  status: AuditStatus;
  normalizedUrl?: string;
  finalUrl?: string;
  failure?: AuditFailure;
}>;

export type TransitionAuditStateOptions = Readonly<{
  expectedEtag?: string;
}>;

export type StoredAuditResult<T = unknown> = Readonly<{
  auditId: string;
  result: T;
  etag: string;
}>;

export type AuditResultWriteReceipt = Readonly<{
  auditId: string;
  etag: string;
}>;

export const reportRequestStatuses = ["requested", "sent", "failed"] as const;

export type ReportRequestStatus = (typeof reportRequestStatuses)[number];

export type ReportRequestReceipt = Readonly<{
  schemaVersion: 1;
  id: string;
  auditId: string;
  name: string;
  email: string;
  status: ReportRequestStatus;
  requestedAt: string;
  providerMessageId?: string;
}>;

export type WriteReportRequestReceiptInput = Readonly<{
  auditId: string;
  requestId?: string;
  name: string;
  email: string;
  status: ReportRequestStatus;
  providerMessageId?: string;
}>;

export type StoredReportRequestReceipt = Readonly<{
  receipt: ReportRequestReceipt;
  etag: string;
}>;

export type AuditReportStoreOptions = Readonly<{
  /**
   * Used only outside production. Production always uses private Vercel Blob.
   */
  localDirectory?: string;
  now?: () => Date;
}>;

export type AuditReportStore = Readonly<{
  createState(input: CreateAuditStateInput): Promise<StoredAuditState>;
  readState(auditId: string): Promise<StoredAuditState | null>;
  transitionState(
    auditId: string,
    transition: AuditStateTransition,
    options?: TransitionAuditStateOptions,
  ): Promise<StoredAuditState>;
  writeResult(
    auditId: string,
    result: unknown,
  ): Promise<AuditResultWriteReceipt>;
  readResult<T = unknown>(
    auditId: string,
    parse?: (value: unknown) => T,
  ): Promise<StoredAuditResult<T> | null>;
  writeReportRequestReceipt(
    input: WriteReportRequestReceiptInput,
  ): Promise<StoredReportRequestReceipt>;
}>;
