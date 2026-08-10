import type { ReactNode } from "react";
import styles from "./resources.module.css";

type ArticleSectionProps = {
  children: ReactNode;
  id: string;
  title: string;
};

export function ArticleSection({ children, id, title }: ArticleSectionProps) {
  return (
    <section id={id} className={styles.proseSection}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

type ArticleCalloutProps = {
  children: ReactNode;
  title: string;
};

export function ArticleCallout({ children, title }: ArticleCalloutProps) {
  return (
    <aside className={styles.callout}>
      <h3>{title}</h3>
      {children}
    </aside>
  );
}

type ComparisonTableProps = {
  caption: string;
  columns: readonly [string, string, string];
  rows: readonly (readonly [string, string, string])[];
};

export function ComparisonTable({
  caption,
  columns,
  rows,
}: ComparisonTableProps) {
  return (
    <div className={styles.tableScroll} tabIndex={0} role="region" aria-label={caption}>
      <table className={styles.comparisonTable}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              <th scope="row">{row[0]}</th>
              <td>{row[1]}</td>
              <td>{row[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
