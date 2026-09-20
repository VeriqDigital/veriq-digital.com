import Link from "next/link";
import Container from "@/components/ui/Container";
import WebsiteAuditLink from "@/components/ui/WebsiteAuditLink";
import { getResource, type ResourceNextStep as NextStep } from "@/data/resources";
import { isWebsiteAuditDiscoverable } from "@/lib/website-audit/runtime-config";
import styles from "@/app/resources/resources.module.css";

const destinationCopy = {
  "/des-moines-web-design": {
    prompt: "Planning a website project in Des Moines?",
    title: "Turn the research into a clear, useful website.",
    label: "Explore Des Moines web design",
  },
  "/small-business-web-design": {
    prompt: "Planning a small-business website project?",
    title: "Turn the research into a clear, useful website.",
    label: "Explore small business web design",
  },
  "/website-redesign": {
    prompt: "Considering a website redesign?",
    title: "Turn the current-site problems into a clear redesign plan.",
    label: "Explore website redesign services",
  },
  "/pricing": {
    prompt: "Planning your website budget?",
    title: "See the starting points. Define the right scope.",
    label: "View website pricing",
  },
  "/website-audit": {
    prompt: "Automated checks can inform a hands-on review, but cannot assess the complete customer experience.",
    title: "Start with a few checks on your current site.",
    label: "Audit Your Website",
  },
} as const;

export default function ResourceNextStep({
  nextStep,
  auditDiscoverable = isWebsiteAuditDiscoverable(),
}: {
  nextStep: NextStep;
  auditDiscoverable?: boolean;
}) {
  const href = typeof nextStep === "string"
    ? nextStep
    : auditDiscoverable ? "/website-audit" : nextStep.fallback;
  const copy = href.startsWith("/resources/")
    ? {
        prompt: "Continue with the next practical question",
        title: getResource(href.slice("/resources/".length))?.title ?? "Keep building a clearer website plan.",
        label: "Read the next guide",
      }
    : destinationCopy[href as keyof typeof destinationCopy];
  const linkContent = <>{copy.label} <span aria-hidden="true">↗</span></>;

  return (
    <section className={styles.articleCta} aria-label="Next step" data-floating-booking-obstruction>
      <Container>
        <div className={styles.articleCtaInner}>
          <p>{copy.prompt}</p>
          <h2>{copy.title}</h2>
          {href === "/website-audit" ? (
            <WebsiteAuditLink placement="resource_next_step">{linkContent}</WebsiteAuditLink>
          ) : (
            <Link href={href}>{linkContent}</Link>
          )}
        </div>
      </Container>
    </section>
  );
}
