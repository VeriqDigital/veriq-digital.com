import { getEvidenceConfidence, getScoreInterpretation } from "./types";
import type { NormalizedScore } from "./types";
import styles from "./website-audit.module.css";

type OverallScoreProps = {
  score: NormalizedScore;
  evidenceCoverage?: NormalizedScore;
  checksCompleted?: number;
  applicableChecks?: number;
  summary?: string;
  compact?: boolean;
};

export default function OverallScore({
  score,
  evidenceCoverage,
  checksCompleted,
  applicableChecks,
  summary,
  compact = false,
}: OverallScoreProps) {
  const interpretation = getScoreInterpretation(score);
  const confidence =
    evidenceCoverage === undefined
      ? null
      : getEvidenceConfidence(evidenceCoverage);

  return (
    <div className={compact ? styles.overallScoreCompact : styles.overallScore}>
      <div className={styles.scoreHeading}>
        <p>Website health score</p>
        <span>
          {interpretation}
        </span>
      </div>
      <div className={styles.scoreValue}>
        <strong>{score}</strong>
        <span>/100</span>
      </div>
      <meter
        className={styles.scoreMeter}
        min={0}
        max={100}
        value={score}
        aria-label={`Website health score: ${score} out of 100, ${interpretation}${confidence ? `; ${confidence.toLowerCase()}` : ""}`}
      >
        {score} out of 100
      </meter>
      {!compact && confidence ? (
        <p className={styles.scoreConfidence}>
          <strong>{confidence}</strong>
          <span>
            {checksCompleted !== undefined && applicableChecks !== undefined
              ? `${checksCompleted} of ${applicableChecks} applicable checks completed · ${evidenceCoverage}% evidence coverage`
              : `${evidenceCoverage}% evidence coverage`}
          </span>
        </p>
      ) : null}
      {!compact && summary ? (
        <p className={styles.scoreExplanation}>{summary}</p>
      ) : null}
    </div>
  );
}
