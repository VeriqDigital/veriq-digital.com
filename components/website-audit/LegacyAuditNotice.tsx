import { CURRENT_AUDIT_METHODOLOGY_VERSION } from "@/lib/website-audit/methodology";

type LegacyAuditNoticeProps = {
  methodologyVersion: string;
  className?: string;
};

export default function LegacyAuditNotice({ methodologyVersion, className }: LegacyAuditNoticeProps) {
  if (methodologyVersion === CURRENT_AUDIT_METHODOLOGY_VERSION) return null;

  return (
    <aside className={className} aria-label="Legacy scoring methodology">
      <p>
        <strong>Legacy scoring methodology ({methodologyVersion}).</strong>{" "}
        Scoring has since been updated. These historical scores and findings are
        preserved as originally reported and have not been recalculated.
      </p>
      <a href="/website-audit">Run a new audit <span aria-hidden="true">↗</span></a>
    </aside>
  );
}
