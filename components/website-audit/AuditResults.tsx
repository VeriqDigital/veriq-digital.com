import CategoryScores from "./CategoryScores";
import FindingCard from "./FindingCard";
import { pluralLabel } from "./format-count";
import FullReportForm from "./FullReportForm";
import OverallScore from "./OverallScore";
import type { WebsiteAuditResult } from "./types";
import styles from "./website-audit.module.css";

type AuditResultsProps = {
  result: WebsiteAuditResult;
  variant: "sample" | "live";
};

const getAuditedUrlLabel = (value: string) => {
  try {
    const url = new URL(value);
    return `${url.host}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return "the submitted website";
  }
};

export default function AuditResults({ result, variant }: AuditResultsProps) {
  const isSample = variant === "sample";
  const idPrefix = isSample ? "sample-audit" : `website-audit-${result.id}`;
  const categoryTitleId = `${idPrefix}-category-score-title`;
  const findingsTitleId = `${idPrefix}-findings-title`;
  const fullReportTitleId = `${idPrefix}-full-report-title`;

  return (
    <div className={styles.resultsShell}>
      <header className={styles.resultsHeader}>
        <div>
          <p className={styles.demoLabel}>
            {isSample ? "Sample audit · Demo data" : "Completed website audit"}
          </p>
          <h2>
            {isSample
              ? "See the site’s health in one clear view."
              : "Your website’s health, prioritized."}
          </h2>
        </div>
        <p>
          {isSample
            ? "This example shows how a finished report is organized. It was not produced by a live scan and does not describe a real business."
            : `This report reflects automated checks of ${getAuditedUrlLabel(result.auditedUrl)} at the time of the audit.`}
        </p>
      </header>

      <div className={styles.scoreOverview}>
        <OverallScore score={result.overallScore} summary={result.overallSummary} />
        <dl className={styles.resultSummary} aria-label="Audit summary">
          <div>
            <dt>
              {pluralLabel(result.summary.criticalIssues, "Critical issue")}
            </dt>
            <dd>{result.summary.criticalIssues}</dd>
          </div>
          <div>
            <dt>{pluralLabel(result.summary.improvements, "Improvement")}</dt>
            <dd>{result.summary.improvements}</dd>
          </div>
          <div>
            <dt>{pluralLabel(result.summary.opportunities, "Opportunity")}</dt>
            <dd>{result.summary.opportunities}</dd>
          </div>
          <div>
            <dt>{pluralLabel(result.summary.passedChecks, "Passed check")}</dt>
            <dd>{result.summary.passedChecks}</dd>
          </div>
        </dl>
      </div>

      {result.notices.length > 0 ? (
        <ul className={styles.resultNotices} aria-label="Important audit notes">
          {result.notices.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
      ) : null}

      <section className={styles.resultSection} aria-labelledby={categoryTitleId}>
        <div className={styles.resultSectionHeading}>
          <p>Health by category</p>
          <h2 id={categoryTitleId}>
            Where the website is strong — and where it needs work.
          </h2>
        </div>
        <CategoryScores scores={result.categoryScores} />
      </section>

      <section className={styles.resultSection} aria-labelledby={findingsTitleId}>
        <div className={styles.resultSectionHeading}>
          <p>Prioritized findings</p>
          <h2 id={findingsTitleId}>Fix the issues with the greatest impact first.</h2>
        </div>
        {result.findings.length > 0 ? (
          <div className={styles.findingsList}>
            {result.findings.map((finding) => (
              <FindingCard finding={finding} key={finding.id} />
            ))}
          </div>
        ) : (
          <p className={styles.emptyFindings}>
            No prioritized findings were generated from the checks that completed.
          </p>
        )}
      </section>

      {!isSample ? (
        <section className={styles.fullReport} aria-labelledby={fullReportTitleId}>
          <div>
            <p>Keep the report</p>
            <h2 id={fullReportTitleId}>Send this report to your inbox.</h2>
            <p>
              We’ll email a direct link so you can return to these scores,
              findings, and recommended next steps when you are ready.
            </p>
          </div>
          <FullReportForm auditId={result.id} />
        </section>
      ) : null}
    </div>
  );
}
