import { getScoreInterpretation } from "./types";
import type { AuditCategoryScore } from "./types";
import styles from "./website-audit.module.css";

type CategoryScoresProps = {
  scores: AuditCategoryScore[];
  compact?: boolean;
};

export default function CategoryScores({ scores, compact = false }: CategoryScoresProps) {
  return (
    <div className={compact ? styles.categoryScoresCompact : styles.categoryScores}>
      {scores.map((category) => (
        <article className={styles.categoryScore} key={category.id}>
          <div className={styles.categoryScoreHeading}>
            <div>
              {compact ? (
                <span className={styles.compactCategoryLabel}>{category.label}</span>
              ) : (
                <h3>{category.label}</h3>
              )}
              {!compact ? <p>{category.summary}</p> : null}
            </div>
            <p aria-label={`${category.score} out of 100, ${getScoreInterpretation(category.score)}`}>
              <strong>{category.score}</strong>
              <span>/100</span>
            </p>
          </div>
          <div className={styles.categoryTrack} aria-hidden="true">
            <span style={{ width: `${category.score}%` }} />
          </div>
          {!compact ? (
            <small>{getScoreInterpretation(category.score)}</small>
          ) : null}
        </article>
      ))}
    </div>
  );
}
