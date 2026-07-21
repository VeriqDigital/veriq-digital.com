import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";
import WorksBackdrop from "./WorksBackdrop";
import styles from "./WorksSection.module.css";

type WorksSectionProps = {
  detailed?: boolean;
};

const WorksSection = ({ detailed = false }: WorksSectionProps) => {
  return (
    <div className={styles.works}>
      <WorksBackdrop />
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            Selected work
          </p>
          <h2>
            Built to be <span>used, remembered,</span> and trusted.
          </h2>
        </div>
        <p>
          Self-directed builds showing the business problem, what Veriq built,
          and what each experience was intended to improve—without invented
          performance claims.
        </p>
      </header>

      <div className={styles.grid}>
        {projects.map((project, index) => (
          <Link
            href={`/work/${project.slug}`}
            key={project.slug}
            className={styles.project}
          >
            <div className={styles.imageWrap}>
              <Image
                src={project.image}
                alt={project.imageAlt}
                fill
                sizes={
                  index === 0
                    ? "(max-width: 768px) 100vw, 66vw"
                    : "(max-width: 768px) 100vw, 42vw"
                }
                className={styles.image}
              />
              <span className={styles.viewProject}>
                View project <i aria-hidden="true">↗</i>
              </span>
            </div>
            <div className={styles.projectMeta}>
              <div>
                <h3>{project.title}</h3>
                <p>{project.category}</p>
                <p className={styles.projectSummary}>{project.previewSummary}</p>
              </div>
              <span>{project.year}</span>
            </div>
            {detailed && (
              <dl className={styles.projectDetails}>
                <div>
                  <dt>Status</dt>
                  <dd>{project.status}</dd>
                </div>
                <div>
                  <dt>Problem explored</dt>
                  <dd>{project.problemExplored}</dd>
                </div>
                <div>
                  <dt>Built</dt>
                  <dd>{project.built}</dd>
                </div>
                <div>
                  <dt>Intended outcome</dt>
                  <dd>{project.outcome}</dd>
                </div>
              </dl>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WorksSection;
