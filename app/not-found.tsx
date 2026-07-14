import Link from "next/link";
import Container from "@/components/ui/Container";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />

      <Container>
        <div className={styles.layout}>
          <div className={styles.content}>
            <p className={styles.eyebrow}>
              <span /> Page not found
            </p>

            <p className={styles.errorCode} aria-hidden="true">
              404
            </p>

            <h1>
              Wrong turn.
              <span>Let&apos;s get you moving again.</span>
            </h1>

            <p className={styles.description}>
              Looks like this page doesn&apos;t exist anymore. Let&apos;s get you headed
              in the right direction.
            </p>

            <div className={styles.actions}>
              <Link href="/" className={styles.primaryAction}>
                Back home <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/work" className={styles.secondaryAction}>
                View our work <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className={styles.orbitGraphic} aria-hidden="true">
            <div className={styles.orbitOuter}>
              <span className={styles.nodePrimary} />
            </div>
            <div className={styles.orbitInner}>
              <span className={styles.nodeDark} />
            </div>
            <div className={styles.core}>?</div>
          </div>
        </div>
      </Container>
    </main>
  );
}
