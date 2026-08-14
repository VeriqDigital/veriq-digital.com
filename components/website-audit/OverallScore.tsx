import { getScoreInterpretation } from "./types";
import type { NormalizedScore } from "./types";
import styles from "./website-audit.module.css";

type OverallScoreProps = {
  score: NormalizedScore;
  evidenceCoverage?: NormalizedScore;
  summary?: string;
  compact?: boolean;
};

export default function OverallScore({
  score,
  evidenceCoverage,
  summary,
  compact = false,
}: OverallScoreProps) {
  const interpretation = getScoreInterpretation(score);

  return (
    <div className={compact ? styles.overallScoreCompact : styles.overallScore}>
      <div className={styles.scoreHeading}>
        <p>Overall website score</p>
        <span>
          {interpretation}
          {evidenceCoverage !== undefined ? ` · ${evidenceCoverage}% evidence` : ""}
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
        aria-label={`Overall website score: ${score} out of 100, ${interpretation}`}
      >
        {score} out of 100
      </meter>
      {!compact && summary ? (
        <p className={styles.scoreExplanation}>{summary}</p>
      ) : null}
    </div>
  );
}
