import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";
import styles from "./WorksSection.module.css";

type WorksSectionProps = {
  headingLevel?: "h1" | "h2";
};

const WorksSection = ({ headingLevel = "h2" }: WorksSectionProps) => {
  const Heading = headingLevel;

  return (
    <div className={styles.works}>
      <header className={styles.header}>
        <div>
          {headingLevel === "h1" ? (
            <p className={styles.eyebrow}>
              <span aria-hidden="true" />
              Selected work
            </p>
          ) : null}
          <Heading>
            Built to be <span>used, remembered,</span> and trusted.
          </Heading>
        </div>
        <p>
          Business websites built around the job at hand. Clearer messaging,
          stronger credibility, better usability, and custom functionality where
          it adds real value.
        </p>
      </header>

      <div className={styles.grid}>
        {projects.map((project, index) => (
          <Link
            href={`/work/${project.slug}`}
            key={project.slug}
            className={`${styles.project} ${index === 0 ? styles.projectPrimary : index === 1 ? styles.projectSecondary : styles.projectTertiary}`}
          >
            <div className={styles.imageWrap}>
              <Image
                src={project.image}
                alt={project.imageAlt}
                fill
                sizes={
                  index === 0
                    ? "(max-width: 800px) calc(100vw - 3rem), (max-width: 1280px) 79vw, 980px"
                    : index === 1
                      ? "(max-width: 800px) calc(100vw - 3rem), (max-width: 1280px) 66vw, 780px"
                      : "(max-width: 800px) calc(100vw - 3rem), (max-width: 1280px) 70vw, 900px"
                }
                className={styles.image}
              />
              <span className={styles.viewProject}>
                View project <i aria-hidden="true">↗</i>
              </span>
            </div>
            <div className={styles.projectMeta}>
              <div>
                <div className={styles.projectHeading}>
                  <div>
                    <h3>{project.title}</h3>
                    <p>{project.category} · {project.year}</p>
                  </div>
                  <span aria-hidden="true">↗</span>
                </div>
                <p className={styles.projectSummary}>{project.summary}</p>
                <ul className={styles.projectServices} aria-label={`${project.title} services`}>
                  {project.services.slice(0, 3).map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WorksSection;
