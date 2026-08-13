import CategoryScores from "./CategoryScores";
import FindingCard from "./FindingCard";
import FullReportForm from "./FullReportForm";
import OverallScore from "./OverallScore";
import type { WebsiteAuditResult } from "./types";
import styles from "./website-audit.module.css";

type AuditResultsProps = {
  result: WebsiteAuditResult;
};

export default function AuditResults({ result }: AuditResultsProps) {
  return (
    <div className={styles.resultsShell}>
      <header className={styles.resultsHeader}>
        <div>
          <p className={styles.demoLabel}>Sample audit · Demo data</p>
          <h2>See the site’s health in seconds.</h2>
        </div>
        <p>
          These illustrative results demonstrate the interface only. They were
          not produced by a live scan and do not describe a real business.
        </p>
      </header>

      <div className={styles.scoreOverview}>
        <OverallScore score={result.overallScore} summary={result.overallSummary} />
        <dl className={styles.resultSummary} aria-label="Audit summary">
          <div>
            <dt>Critical issues</dt>
            <dd>{result.summary.criticalIssues}</dd>
          </div>
          <div>
            <dt>Improvements</dt>
            <dd>{result.summary.improvements}</dd>
          </div>
          <div>
            <dt>Opportunities</dt>
            <dd>{result.summary.opportunities}</dd>
          </div>
          <div>
            <dt>Passed checks</dt>
            <dd>{result.summary.passedChecks}</dd>
          </div>
        </dl>
      </div>

      <section className={styles.resultSection} aria-labelledby="category-score-title">
        <div className={styles.resultSectionHeading}>
          <p>Health by category</p>
          <h2 id="category-score-title">Where the website is strong — and where it needs work.</h2>
        </div>
        <CategoryScores scores={result.categoryScores} />
      </section>

      <section className={styles.resultSection} aria-labelledby="findings-title">
        <div className={styles.resultSectionHeading}>
          <p>Prioritized findings</p>
          <h2 id="findings-title">Fix the issues with the greatest impact first.</h2>
        </div>
        <div className={styles.findingsList}>
          {result.findings.map((finding) => (
            <FindingCard finding={finding} key={finding.id} />
          ))}
        </div>
      </section>

      <section className={styles.fullReport} aria-labelledby="full-report-title">
        <div>
          <p>Complete report</p>
          <h2 id="full-report-title">Want every issue and recommended fix?</h2>
          <p>
            The delivery step is designed for a future complete report with all
            checks, explanations, and priorities — after the useful free results.
          </p>
        </div>
        <FullReportForm auditId={result.id} />
      </section>
    </div>
  );
}
