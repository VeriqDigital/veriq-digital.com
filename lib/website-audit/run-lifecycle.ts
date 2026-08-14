type ReconciliationState = Readonly<{
  etag: string;
  status: string;
}>;

export class PersistedAuditResultControlPlaneError extends Error {
  constructor(options?: ErrorOptions) {
    super(
      "The audit result is persisted but its state could not be reconciled.",
      options,
    );
    this.name = "PersistedAuditResultControlPlaneError";
  }
}

export async function reconcilePersistedAuditResult<
  Result extends Readonly<{ auditedUrl: string }>,
>({
  result,
  readState,
  readPersistedResult,
  transitionToCompleted,
}: Readonly<{
  result: Result;
  readState: () => Promise<ReconciliationState | null>;
  readPersistedResult: () => Promise<Result | null>;
  transitionToCompleted: (
    finalUrl: string,
    expectedEtag: string,
  ) => Promise<void>;
}>): Promise<Result> {
  try {
    const latest = await readState();

    if (!latest) {
      throw new Error("The audit state is temporarily unavailable.");
    }

    if (latest.status === "running") {
      await transitionToCompleted(result.auditedUrl, latest.etag);
    } else if (latest.status !== "completed") {
      throw new Error("The audit state changed before completion.");
    }

    return result;
  } catch (cause) {
    const recovered = await readPersistedResult().catch(() => null);

    if (recovered) {
      return recovered;
    }

    throw new PersistedAuditResultControlPlaneError({ cause });
  }
}

export const shouldTerminallyFailAudit = (
  resultPersisted: boolean,
  error: unknown,
) =>
  !resultPersisted &&
  !(error instanceof PersistedAuditResultControlPlaneError);
