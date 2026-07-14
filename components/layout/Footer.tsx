import Link from "next/link";
import { footerLinks, siteConfig } from "@/config/site";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              {siteConfig.name}
            </Link>
            <p>{siteConfig.tagline}</p>
            <span>Des Moines, Iowa &middot; Local + remote</span>
          </div>

          <nav className={styles.navigation} aria-label="Footer navigation">
            <div className={styles.navigationHeading}>
              <span>Explore</span>
              <i aria-hidden="true" />
            </div>
            <div className={styles.linkGrid}>
              {footerLinks.map((link, index) => (
                <Link href={link.href} key={link.href}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {link.label}
                  <i aria-hidden="true">↘</i>
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <a className={styles.email} href={`mailto:${siteConfig.contact.email}`}>
          <span>Start a conversation</span>
          <strong>{siteConfig.contact.email}</strong>
          <i aria-hidden="true">↗</i>
        </a>

        <div className={styles.bottom}>
          <p>&copy; 2026 {siteConfig.name}. All rights reserved.</p>
          <span aria-hidden="true" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
