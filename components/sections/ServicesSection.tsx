import Link from "next/link";
import { services } from "@/data/services";
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

  if (name === "search") {
    return (
      <svg viewBox="0 0 24 24">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 4.5 4.5M10.5 7.5v6M7.5 10.5h6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24">
      <path d="M6.5 4.5h11v15h-11zM9 8h6M9 12h6M9 16h3" />
    </svg>
  );
};

const ServicesSection = () => {
  return (
    <div className={styles.services}>
      <div className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            What we do
          </p>
          <h2 className={styles.heading}>
            What Veriq can help <span>you improve.</span>
          </h2>
        </div>
        <div className={styles.introLinks}>
          <Link href="/services" className={styles.servicesLink}>
            Explore websites, SEO &amp; conversion
            <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/blog" className={styles.resourcesLink}>
            Browse website guides
            <span aria-hidden="true">↗</span>
          </Link>
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
              <ul className={styles.capabilities} aria-label={`${service.title} capabilities`}>
                {service.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
              <Link href={service.href} className={styles.cardLink}>
                {service.linkLabel}
                <span aria-hidden="true">↗</span>
              </Link>
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
