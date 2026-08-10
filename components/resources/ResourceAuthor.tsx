import Link from "next/link";
import { resourceAuthor } from "@/data/resource-author";
import styles from "./resources.module.css";

type ResourceAuthorProps = {
  dateModified?: string;
  publishedAt: string;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

export default function ResourceAuthor({
  dateModified,
  publishedAt,
}: ResourceAuthorProps) {
  return (
    <aside className={styles.author} aria-label="About the author">
      <p className={styles.authorLabel}>Written by</p>
      <p className={styles.authorIdentity}>
        <Link href={resourceAuthor.href}>{resourceAuthor.name}</Link>
        <span>{resourceAuthor.role}</span>
      </p>
      <p className={styles.authorBio}>{resourceAuthor.bio}</p>
      <p className={styles.authorDates}>
        Published <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
        {dateModified ? (
          <>
            {" "}· Updated{" "}
            <time dateTime={dateModified}>{formatDate(dateModified)}</time>
          </>
        ) : null}
      </p>
    </aside>
  );
}
