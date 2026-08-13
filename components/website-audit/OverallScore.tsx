import { getScoreInterpretation } from "./types";
import type { NormalizedScore } from "./types";
import styles from "./website-audit.module.css";

type OverallScoreProps = {
  score: NormalizedScore;
  summary?: string;
  compact?: boolean;
};

export default function OverallScore({
  score,
  summary,
  compact = false,
}: OverallScoreProps) {
  const interpretation = getScoreInterpretation(score);

  return (
    <div className={compact ? styles.overallScoreCompact : styles.overallScore}>
      <div className={styles.scoreHeading}>
        <p>Overall website score</p>
        <span>{interpretation}</span>
      </div>
      <div className={styles.scoreValue} aria-label={`${score} out of 100, ${interpretation}`}>
        <strong>{score}</strong>
        <span>/100</span>
      </div>
      <div className={styles.scoreTrack} aria-hidden="true">
        <span style={{ width: `${score}%` }} />
      </div>
      {!compact && summary ? (
        <p className={styles.scoreExplanation}>{summary}</p>
      ) : null}
    </div>
  );
}
