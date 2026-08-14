import CategoryScores from "./CategoryScores";
import { formatCount } from "./format-count";
import OverallScore from "./OverallScore";
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
      <OverallScore score={result.overallScore} compact />
      <CategoryScores scores={result.categoryScores} compact />
      <footer>
        <span>{formatCount(result.summary.criticalIssues, "critical issue")}</span>
        <a href="#sample-audit-results">View sample findings ↘</a>
      </footer>
    </aside>
  );
}
