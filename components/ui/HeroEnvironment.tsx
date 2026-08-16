import styles from "./HeroEnvironment.module.css";

const HeroEnvironment = () => {
  return (
    <div className={styles.environment} aria-hidden="true">
      <div className={styles.grid} />
    </div>
  );
};

export default HeroEnvironment;
