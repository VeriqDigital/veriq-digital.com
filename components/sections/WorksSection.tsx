import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";
import WorksBackdrop from "./WorksBackdrop";
import styles from "./WorksSection.module.css";

type WorksSectionProps = {
  headingLevel?: "h1" | "h2";
};

const WorksSection = ({ headingLevel = "h2" }: WorksSectionProps) => {
  const Heading = headingLevel;

  return (
    <div className={styles.works}>
      <WorksBackdrop />
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            Selected work
          </p>
          <Heading>
            Built to be <span>used, remembered,</span> and trusted.
          </Heading>
        </div>
        <p>
          Focused digital experiences designed to sharpen brands, simplify
          interactions, and help businesses make a stronger impression online.
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
                <h3>{project.title}</h3>
                <p>{project.category}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WorksSection;
