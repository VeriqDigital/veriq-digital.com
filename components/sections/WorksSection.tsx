import Image from "next/image";
import Link from "next/link";
import ProjectTypeLabel from "@/components/work/ProjectTypeLabel";
import { projects } from "@/data/projects";
import styles from "./WorksSection.module.css";

type WorksSectionProps = {
  headingLevel?: "h1" | "h2";
};

const WorksSection = ({ headingLevel = "h2" }: WorksSectionProps) => {
  const Heading = headingLevel;
  const ProjectHeading = headingLevel === "h1" ? "h2" : "h3";

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
        {projects.map((project, index) => {
          const isStaggered = index % 2 === 1;

          return (
            <Link
              href={`/work/${project.slug}`}
              key={project.slug}
              className={`${styles.project}${isStaggered ? ` ${styles.projectStaggered}` : ""}`}
            >
              <div className={styles.imageWrap}>
                <Image
                  src={project.image}
                  alt={project.imageAlt}
                  fill
                  sizes="(max-width: 759px) calc(100vw - 3rem), (max-width: 1340px) calc(50vw - 2.75rem), 600px"
                  className={styles.image}
                />
              </div>
              <div className={styles.projectMeta}>
                <div className={styles.projectHeading}>
                  <ProjectHeading>{project.title}</ProjectHeading>
                  <span aria-hidden="true">↗</span>
                </div>
                <p className={styles.projectCategory}>{project.category}</p>
                <ProjectTypeLabel
                  className={styles.projectType}
                  projectType={project.projectType}
                />
                <p className={styles.projectSummary}>{project.summary}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default WorksSection;
