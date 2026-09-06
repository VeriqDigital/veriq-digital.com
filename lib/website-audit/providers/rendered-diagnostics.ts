export type RenderStage =
  | "executable_resolution" | "browser_launch" | "browser_connection"
  | "context_creation" | "page_creation" | "sanitization" | "route_setup"
  | "navigation" | "resource_fulfillment" | "measurement" | "context_close";

export type RenderFailureCode =
  | "timeout" | "aborted" | "executable_missing" | "permission_denied"
  | "disk_full" | "out_of_memory" | "browser_closed" | "browser_crashed"
  | "missing_runtime_library" | "protocol_error" | "navigation_network_error"
  | "evaluation_reference_error" | "operation_failed";

/** Only allowlisted classifications leave this module, never error text/names. */
export function classifyRenderFailure(error: unknown): RenderFailureCode {
  if (!(error instanceof Error)) return "operation_failed";
  if (error.name === "TimeoutError") return "timeout";
  if (error.name === "AbortError") return "aborted";
  const code = "code" in error ? error.code : undefined;
  if (code === "ENOENT") return "executable_missing";
  if (code === "EACCES" || code === "EPERM") return "permission_denied";
  if (code === "ENOSPC") return "disk_full";
  if (code === "ENOMEM") return "out_of_memory";
  if (/Executable doesn't exist/i.test(error.message)) return "executable_missing";
  if (/error while loading shared libraries/i.test(error.message)) return "missing_runtime_library";
  if (/Target (?:page, context or browser|closed)|browser has been closed/i.test(error.message)) return "browser_closed";
  if (/page crashed|browser crashed/i.test(error.message)) return "browser_crashed";
  if (/Protocol error/i.test(error.message)) return "protocol_error";
  if (/net::ERR_[A-Z_]+/.test(error.message)) return "navigation_network_error";
  if (/ReferenceError: .* is not defined/.test(error.message)) return "evaluation_reference_error";
  return "operation_failed";
}

export class RenderStageError extends Error {
  constructor(readonly stage: RenderStage, readonly code: RenderFailureCode) {
    super("Restricted mobile render stage failed");
    this.name = "RenderStageError";
  }
}

export async function runRenderedStage<T>(stage: RenderStage, operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw error instanceof RenderStageError ? error : new RenderStageError(stage, classifyRenderFailure(error));
  }
}

export function logRenderedFailure(error: unknown, durationMs: number, aborted = false) {
  const stage = error instanceof RenderStageError ? error.stage : "measurement";
  const code = error instanceof RenderStageError ? error.code : classifyRenderFailure(error);
  const reason = aborted || code === "timeout" || code === "aborted" ? "timeout"
    : stage === "executable_resolution" || stage === "browser_launch" || stage === "browser_connection"
      ? "browser_unavailable" : "render_error";
  console.warn("Website audit rendered-mobile provider unavailable", { reason, stage, code, durationMs });
  return reason;
}
