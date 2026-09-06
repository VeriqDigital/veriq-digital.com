import CategoryScores from "./CategoryScores";
import { formatCount } from "./format-count";
import OverallScore from "./OverallScore";
import LegacyAuditNotice from "./LegacyAuditNotice";
import type { WebsiteAuditResult } from "./types";
import styles from "./website-audit.module.css";

type AuditPreviewProps = {
  result: WebsiteAuditResult;
};

export default function AuditPreview({ result }: AuditPreviewProps) {
  return (
    <aside className={styles.auditPreview} aria-label="Sample website audit preview">
      <header>
        <div>
          <span>Sample audit</span>
          <p>Example report preview</p>
        </div>
        <span className={styles.previewStatus}>Demo data</span>
      </header>
      <LegacyAuditNotice methodologyVersion={result.methodologyVersion} className={styles.methodologyNotice} />
      <OverallScore score={result.overallScore} methodologyVersion={result.methodologyVersion} compact />
      <CategoryScores scores={result.categoryScores} methodologyVersion={result.methodologyVersion} compact />
      <footer>
        <span>{formatCount(result.summary.criticalIssues, "critical issue")}</span>
        <a href="#sample-audit-results">View sample findings ↘</a>
      </footer>
    </aside>
  );
}
