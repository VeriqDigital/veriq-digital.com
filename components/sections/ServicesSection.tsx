import { services } from "@/data/services";
import ServicesBackdrop from "./ServicesBackdrop";
import styles from "./ServicesSection.module.css";

type ServiceIconProps = {
  name: (typeof services)[number]["icon"];
};

const ServiceIcon = ({ name }: ServiceIconProps) => {
  if (name === "globe") {
    return (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5S14.1 18.2 12 20.5M12 3.5C9.9 5.8 8.8 8.6 8.8 12s1.1 6.2 3.2 8.5" />
      </svg>
    );
  }

  if (name === "command") {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M9 9H6.5A2.5 2.5 0 1 1 9 6.5V17.5A2.5 2.5 0 1 1 6.5 15H17.5A2.5 2.5 0 1 1 15 17.5V6.5A2.5 2.5 0 1 1 17.5 9H9Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24">
      <path d="m4 17 5.2-5.2 3.4 3.4L20 7.8" />
      <path d="M14.5 7.8H20v5.5" />
    </svg>
  );
};

const ServicesSection = () => {
  return (
    <div className={styles.services}>
      <ServicesBackdrop />
      <div className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            What we do
          </p>
          <h2 className={styles.heading}>
            Digital work with <span>real-world weight.</span>
          </h2>
        </div>
      </div>

      <div className={styles.serviceGrid}>
        {services.map((service, index) => (
          <article key={service.title} className={styles.card}>
            <div className={styles.cardMeta}>
              <span>0{index + 1}</span>
              <i aria-hidden="true" />
            </div>
            <div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
            <span
              className={`${styles.cardIcon} ${styles[service.icon]}`}
              aria-hidden="true"
            >
              <ServiceIcon name={service.icon} />
            </span>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ServicesSection;
