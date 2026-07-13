import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";
import WorksBackdrop from "./WorksBackdrop";
import styles from "./WorksSection.module.css";

const WorksSection = () => {
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
          Two self-directed builds exploring how focused design and development
          can give local businesses a sharper digital presence.
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
              </div>
              <span>{project.year}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WorksSection;
