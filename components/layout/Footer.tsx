import Link from "next/link";
import SocialLinks from "@/components/ui/SocialLinks";
import WebsiteAuditLink from "@/components/ui/WebsiteAuditLink";
import { footerGroups, siteConfig } from "@/config/site";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer} data-site-footer>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              {siteConfig.shortName}
            </Link>
            <p>{siteConfig.tagline}</p>
            <span>Des Moines, Iowa &middot; Local + remote</span>
            <SocialLinks className={styles.socialLinks} />
          </div>

          <nav className={styles.navigation} aria-label="Footer navigation">
            <div className={styles.navigationHeading}>
              <span>Explore Veriq</span>
              <i aria-hidden="true" />
            </div>
            <div className={styles.groupGrid}>
              {footerGroups.map((group) => (
                <div className={styles.linkGroup} key={group.label}>
                  <h2>{group.label}</h2>
                  <ul>
                    {group.links.map((link) => (
                      <li key={`${group.label}-${link.label}`}>
                        {link.href === "/website-audit" ? (
                          <WebsiteAuditLink placement="footer_resources">
                            {link.label}
                          </WebsiteAuditLink>
                        ) : (
                          <Link href={link.href}>{link.label}</Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
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
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <span aria-hidden="true" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
