import Container from "@/components/ui/Container";
import styles from "./BusinessOutcome.module.css";

const outcomes = [
  "Get found by the right customers",
  "Turn visits into inquiries",
  "Reduce repetitive work",
  "Keep improving after launch",
] as const;

export default function BusinessOutcome() {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.composition}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" />
              Built around the business
            </p>
            <h2>Good digital work should make something easier.</h2>
            <p>
              That might mean helping more customers find you, making it easier
              to request a quote, replacing a manual workflow, or giving your
              team a better tool. The deliverable depends on the problem.
            </p>
          </div>

          <div className={styles.grid}>
            {outcomes.map((outcome, index) => (
              <article key={outcome}>
                <span>0{index + 1}</span>
                <p>{outcome}</p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
