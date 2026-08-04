import { siteConfig } from "@/config/site";
import styles from "./SocialLinks.module.css";

type SocialLinksProps = {
  className?: string;
};

const icons = {
  Facebook: (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.facebookIcon}
    >
      <path d="M14 8.5V7c0-1.4.9-2 2.2-2H18V2.2c-.8-.1-1.8-.2-2.8-.2-2.8 0-4.7 1.7-4.7 4.8v1.7H8v3.2h2.5V22H14V11.7h3l.5-3.2H14Z" />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.4" cy="6.6" r="1" className={styles.iconDot} />
    </svg>
  ),
} as const;

const SocialLinks = ({ className }: SocialLinksProps) => {
  return (
    <div className={`${styles.links}${className ? ` ${className}` : ""}`}>
      {siteConfig.socialLinks.map((socialLink) => (
        <a
          key={socialLink.name}
          href={socialLink.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={socialLink.ariaLabel}
          className={styles.link}
        >
          {icons[socialLink.name]}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
