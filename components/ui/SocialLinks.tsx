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
      className={styles.filledIcon}
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
  LinkedIn: (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.filledIcon}
    >
      <path d="M6.5 8.25H3.25V21H6.5V8.25ZM4.88 2A1.88 1.88 0 1 0 4.88 5.75 1.88 1.88 0 0 0 4.88 2ZM21 13.69C21 9.84 18.94 8.06 16.2 8.06A4.14 4.14 0 0 0 12.45 10.12V8.25H9.2V21H12.45V14.69C12.45 13.03 12.77 11.42 14.83 11.42 16.86 11.42 16.89 13.32 16.89 14.8V21H21V13.69Z" />
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
