import type { AuditFinding, AuditSeverity } from "./types";
import styles from "./website-audit.module.css";

const severityLabels: Record<AuditSeverity, string> = {
  critical: "Critical issue",
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
  opportunity: "Opportunity",
  passed: "Passed check",
};

type FindingCardProps = {
  finding: AuditFinding;
};

export default function FindingCard({ finding }: FindingCardProps) {
  return (
    <article className={styles.findingCard} data-severity={finding.severity}>
      <header className={styles.findingHeader}>
        <span className={styles.severityLabel}>{severityLabels[finding.severity]}</span>
        <span>{finding.categoryLabel}</span>
      </header>
      <div className={styles.findingLead}>
        <h3>{finding.title}</h3>
        <p>{finding.explanation}</p>
      </div>
      <div className={styles.findingDetails}>
        <div>
          <h4>Why it matters</h4>
          <p>{finding.whyItMatters}</p>
        </div>
        <div>
          <h4>Recommended fix</h4>
          <p>{finding.recommendation}</p>
        </div>
      </div>
      {finding.observedValue || finding.recommendedValue || finding.supportingMetric ? (
        <dl className={styles.technicalDetails}>
          {finding.observedValue ? (
            <div>
              <dt>Observed</dt>
              <dd>{finding.observedValue}</dd>
            </div>
          ) : null}
          {finding.recommendedValue ? (
            <div>
              <dt>Recommended</dt>
              <dd>{finding.recommendedValue}</dd>
            </div>
          ) : null}
          {finding.supportingMetric ? (
            <div>
              <dt>{finding.supportingMetric.label}</dt>
              <dd>
                {finding.supportingMetric.value}
                {finding.supportingMetric.context ? (
                  <small>{finding.supportingMetric.context}</small>
                ) : null}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </article>
  );
}

