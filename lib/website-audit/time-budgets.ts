// Route budgets are measured from POST entry, including preflight work.
// Keep maxDuration's static literal in the route synchronized via regression test.
export const auditTimeBudgets = Object.freeze({
  platformMs: 60_000,
  routeMs: 55_000,
  engineMs: 51_000,
  scoringReserveMs: 2_000,
  pageSpeedMs: 44_000,
  minimumPageSpeedRetryMs: 20_000,
});

export const remainingBudgetMs = (deadlineAt: number, maximumMs: number, now = Date.now()) =>
  Math.max(0, Math.min(maximumMs, deadlineAt - now));

/** A cancellable timer, shared across all attempts; never resets for retries. */
export function createAuditDeadline(timeoutMs: number, parent?: AbortSignal) {
  const controller = new AbortController();
  const abort = () => controller.abort(new DOMException("Audit deadline reached", "TimeoutError"));
  const timer = setTimeout(abort, Math.max(0, timeoutMs));
  if (timeoutMs <= 0) abort();
  return {
    signal: parent ? AbortSignal.any([parent, controller.signal]) : controller.signal,
    dispose: () => clearTimeout(timer),
  };
}
