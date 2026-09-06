import { getAuditCategory } from "@/lib/website-audit/categories";
import { getCategoryScorePresentation } from "./types";
import type { AuditCategoryScore } from "./types";
import styles from "./website-audit.module.css";

type CategoryScoresProps = {
  scores: readonly AuditCategoryScore[];
  methodologyVersion: string;
  compact?: boolean;
};

export default function CategoryScores({
  scores,
  methodologyVersion,
  compact = false,
}: CategoryScoresProps) {
  return (
    <div className={compact ? styles.categoryScoresCompact : styles.categoryScores}>
      {scores.map((category) => {
        const definition = getAuditCategory(category.id);
        const presentation = getCategoryScorePresentation(category, methodologyVersion);
        const evidenceLabel =
          category.evidenceLevel === "full"
            ? "Full evidence"
            : category.evidenceLevel === "partial"
              ? `Partial · ${category.evidenceCoverage}% evidence`
              : "Evidence unavailable";

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
                {!compact && presentation.showNumeric ? <p>{presentation.summary}</p> : null}
                <span className={styles.evidenceLabel}>{evidenceLabel}</span>
              </div>
              {presentation.showNumeric && category.score !== null ? (
                <p>
                  <strong>{category.score}</strong>
                  <span>/100</span>
                </p>
              ) : (
                <p
                  className={styles.categoryUnavailable}
                >
                  <strong aria-hidden="true">—</strong>
                  <span>{presentation.display === "withheld" ? "Limited evidence" : "Unavailable"}</span>
                </p>
              )}
            </div>
            {presentation.showNumeric && category.score !== null ? (
              <meter
                className={styles.categoryMeter}
                min={0}
                max={100}
                value={category.score}
                aria-label={`${definition.label}: ${category.score} out of 100, ${presentation.interpretation}; ${evidenceLabel}`}
              >
                {category.score} out of 100
              </meter>
            ) : (
              <p className={styles.unavailableMeter}>
                {presentation.display === "withheld"
                  ? presentation.summary
                  : compact
                  ? "Score unavailable."
                  : "This category was not scored because the required data was unavailable."}
              </p>
            )}
            {presentation.showNumeric && (!compact || presentation.display === "limited") ? <small>{presentation.interpretation}</small> : null}
          </article>
        );
      })}
    </div>
  );
}
