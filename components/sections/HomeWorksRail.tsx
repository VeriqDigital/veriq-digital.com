import Link from "next/link";
import { projects } from "@/data/projects";
import HomeWorksRailTrack, {
  type HomeWorksRailProject,
} from "./HomeWorksRailTrack";
import styles from "./HomeWorksRail.module.css";

const railProjects: HomeWorksRailProject[] = projects.map(
  ({ slug, title, category, image, imageAlt }) => ({
    slug,
    title,
    category,
    image,
    imageAlt,
  }),
);

const HomeWorksRail = () => (
  <div className={styles.works}>
    <header className={styles.header}>
      <div>
        <h2 id="home-work-heading">
          Built to be <span>used, remembered,</span> and trusted.
        </h2>
      </div>
      <div className={styles.headerAside}>
        <p>
          Business websites built around the job at hand. Clearer messaging,
          stronger credibility, better usability, and custom functionality where
          it adds real value.
        </p>
        <Link href="/work" className={styles.viewAllLink}>
          View all work <span aria-hidden="true">→</span>
        </Link>
      </div>
    </header>

    <HomeWorksRailTrack projects={railProjects} />
  </div>
);

export default HomeWorksRail;
