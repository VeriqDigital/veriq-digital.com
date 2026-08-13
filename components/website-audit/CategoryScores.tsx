import { getAuditCategory } from "@/lib/website-audit/categories";
import { getScoreInterpretation } from "./types";
import type { AuditCategoryScore } from "./types";
import styles from "./website-audit.module.css";

type CategoryScoresProps = {
  scores: readonly AuditCategoryScore[];
  compact?: boolean;
};

export default function CategoryScores({
  scores,
  compact = false,
}: CategoryScoresProps) {
  return (
    <div className={compact ? styles.categoryScoresCompact : styles.categoryScores}>
      {scores.map((category) => {
        const definition = getAuditCategory(category.id);
        const interpretation = category.score === null
          ? null
          : getScoreInterpretation(category.score);

        return (
          <article className={styles.categoryScore} key={category.id}>
            <div className={styles.categoryScoreHeading}>
              <div>
                {compact ? (
                  <span className={styles.compactCategoryLabel}>
                    {definition.label}
                  </span>
                ) : (
                  <h3>{definition.label}</h3>
                )}
                {!compact ? <p>{category.summary}</p> : null}
              </div>
              {category.available && category.score !== null && interpretation ? (
                <p>
                  <strong>{category.score}</strong>
                  <span>/100</span>
                </p>
              ) : (
                <p
                  className={styles.categoryUnavailable}
                >
                  <strong aria-hidden="true">—</strong>
                  <span>Unavailable</span>
                </p>
              )}
            </div>
            {category.available && category.score !== null && interpretation ? (
              <meter
                className={styles.categoryMeter}
                min={0}
                max={100}
                value={category.score}
                aria-label={`${definition.label}: ${category.score} out of 100, ${interpretation}`}
              >
                {category.score} out of 100
              </meter>
            ) : (
              <p className={styles.unavailableMeter}>
                {compact
                  ? "Score unavailable."
                  : "This category was not scored because the required data was unavailable."}
              </p>
            )}
            {!compact && interpretation ? <small>{interpretation}</small> : null}
          </article>
        );
      })}
    </div>
  );
}
