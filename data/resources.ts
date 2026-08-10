import type { ComponentType } from "react";
import {
  ChooseWebDesignerArticle,
  LocalDesignerVsAgencyArticle,
  LocalWebsiteEssentialsArticle,
  SmallBusinessWebsiteTimelineArticle,
  SmallBusinessWebsiteValueArticle,
  WebsiteCostArticle,
  WebsiteMistakesArticle,
  WebsiteNotOnGoogleArticle,
} from "@/content/resources";

export type ResourceCategory = "Buying guide" | "Website fundamentals";
export type ResourceFunnel = "Educational" | "Commercial investigation";

export type ResourceArticle = {
  slug: string;
  title: string;
  seoTitle: string;
  shortTitle: string;
  description: string;
  category: ResourceCategory;
  funnel: ResourceFunnel;
  primaryTarget: string;
  secondaryTargets: readonly string[];
  intent: string;
  nextStep: string;
  publishedAt: string;
  /** ISO date for a substantive, verified update; omit for newly published copy. */
  dateModified?: string;
  tableOfContents: readonly { id: string; label: string }[];
  relatedSlugs: readonly string[];
  Content: ComponentType;
};

/**
 * Keyword ownership rule:
 * `/des-moines-web-design` is the sole primary target for transactional local
 * service phrases (for example, "Des Moines web design company" or "website
 * designer Des Moines"). Resources own only the question, cost, comparison,
 * timeline, or educational intent named by their title and target fields.
 */
export const resources: readonly ResourceArticle[] = [
  {
    slug: "how-much-does-a-website-cost-in-des-moines",
    title: "How Much Does a Website Cost in Des Moines?",
    seoTitle: "Website Cost in Des Moines: A Practical Guide",
    shortTitle: "Website costs in Des Moines",
    description:
      "A practical guide to website design costs in Des Moines, including the scope, content, functionality, and support choices that shape a proposal.",
    category: "Buying guide",
    funnel: "Commercial investigation",
    primaryTarget: "website cost Des Moines",
    secondaryTargets: [
      "web design cost Des Moines",
      "website design pricing Des Moines",
      "how much does a website cost in Des Moines",
    ],
    intent: "Understand pricing variables before requesting proposals.",
    nextStep: "/des-moines-web-design",
    publishedAt: "2026-08-09",
    tableOfContents: [
      { id: "why-prices-vary", label: "Why prices vary" },
      { id: "cost-drivers", label: "The main cost drivers" },
      { id: "routes", label: "DIY, template, or custom" },
      { id: "proposal", label: "Reading a proposal" },
      { id: "budget", label: "Planning a useful budget" },
    ],
    relatedSlugs: [
      "how-to-choose-a-web-designer-in-des-moines",
      "how-long-does-it-take-to-build-a-small-business-website",
      "what-should-a-local-business-website-include",
    ],
    Content: WebsiteCostArticle,
  },
  {
    slug: "how-to-choose-a-web-designer-in-des-moines",
    title: "How to Choose a Web Designer in Des Moines",
    seoTitle: "How to Choose a Des Moines Web Designer",
    shortTitle: "Choosing a Des Moines web designer",
    description:
      "A clear framework for comparing Des Moines web designers on business fit, technical quality, ownership, communication, and support.",
    category: "Buying guide",
    funnel: "Commercial investigation",
    primaryTarget: "how to choose a web designer in Des Moines",
    secondaryTargets: [
      "compare Des Moines web designers",
      "questions to ask a web designer",
      "evaluating website design providers",
    ],
    intent: "Evaluate providers before hiring.",
    nextStep: "/des-moines-web-design",
    publishedAt: "2026-08-09",
    tableOfContents: [
      { id: "define-project", label: "Define the project" },
      { id: "evaluate-work", label: "Evaluate the work" },
      { id: "technical-baseline", label: "Check the technical baseline" },
      { id: "ownership-support", label: "Clarify ownership and support" },
      { id: "questions", label: "Questions to ask" },
    ],
    relatedSlugs: [
      "local-web-designer-vs-large-agency",
      "how-much-does-a-website-cost-in-des-moines",
      "website-mistakes-that-cost-local-businesses-customers",
    ],
    Content: ChooseWebDesignerArticle,
  },
  {
    slug: "local-web-designer-vs-large-agency",
    title: "Local Web Designer vs. Large Agency: Which Is Right for Your Business?",
    seoTitle: "Local Web Designer vs. Large Agency",
    shortTitle: "Local designer vs. large agency",
    description:
      "Compare the communication, specialization, capacity, process, and support tradeoffs between a local web designer and a large agency.",
    category: "Buying guide",
    funnel: "Commercial investigation",
    primaryTarget: "local web designer vs large agency",
    secondaryTargets: [
      "web design agency comparison",
      "small studio vs large agency",
      "website provider comparison",
    ],
    intent: "Compare provider models before choosing a partner.",
    nextStep: "/des-moines-web-design",
    publishedAt: "2026-08-09",
    tableOfContents: [
      { id: "difference", label: "The practical difference" },
      { id: "comparison", label: "Side-by-side comparison" },
      { id: "local-fit", label: "When local is a fit" },
      { id: "agency-fit", label: "When an agency is a fit" },
      { id: "decision", label: "Make the decision" },
    ],
    relatedSlugs: [
      "how-to-choose-a-web-designer-in-des-moines",
      "how-much-does-a-website-cost-in-des-moines",
      "what-should-a-local-business-website-include",
    ],
    Content: LocalDesignerVsAgencyArticle,
  },
  {
    slug: "does-your-small-business-need-a-website-in-2026",
    title: "Does Your Small Business Still Need a Website in 2026?",
    seoTitle: "Does a Small Business Need a Website in 2026?",
    shortTitle: "Does your business need a website?",
    description:
      "A practical look at what a business website still does that social profiles and marketplace listings cannot—and when a simple site is enough.",
    category: "Website fundamentals",
    funnel: "Educational",
    primaryTarget: "does a small business need a website in 2026",
    secondaryTargets: [
      "small business website",
      "website vs social media for business",
      "local business website",
    ],
    intent: "Decide whether a website is necessary and what level is appropriate.",
    nextStep: "/resources/what-should-a-local-business-website-include",
    publishedAt: "2026-08-09",
    tableOfContents: [
      { id: "short-answer", label: "The short answer" },
      { id: "social-vs-owned", label: "Social vs. owned presence" },
      { id: "simple-site", label: "When a simple site works" },
      { id: "substantial-site", label: "When more is justified" },
      { id: "decision", label: "A practical decision" },
    ],
    relatedSlugs: [
      "what-should-a-local-business-website-include",
      "website-mistakes-that-cost-local-businesses-customers",
      "why-isnt-my-business-website-showing-up-on-google",
    ],
    Content: SmallBusinessWebsiteValueArticle,
  },
  {
    slug: "what-should-a-local-business-website-include",
    title: "What Should a Local Business Website Include?",
    seoTitle: "Local Business Website Essentials",
    shortTitle: "Local business website essentials",
    description:
      "The practical pages, trust signals, calls to action, accessibility basics, and local SEO foundations a useful local business website needs.",
    category: "Website fundamentals",
    funnel: "Educational",
    primaryTarget: "what should a local business website include",
    secondaryTargets: [
      "local business website essentials",
      "small business website pages",
      "business website checklist",
    ],
    intent: "Plan the content and functional requirements for a local website.",
    nextStep: "/resources/how-much-does-a-website-cost-in-des-moines",
    publishedAt: "2026-08-09",
    tableOfContents: [
      { id: "first-screen", label: "The first screen" },
      { id: "core-pages", label: "Core pages and information" },
      { id: "trust", label: "Trust and proof" },
      { id: "quality", label: "Usability and quality" },
      { id: "measurement", label: "Measurement and maintenance" },
    ],
    relatedSlugs: [
      "does-your-small-business-need-a-website-in-2026",
      "website-mistakes-that-cost-local-businesses-customers",
      "how-long-does-it-take-to-build-a-small-business-website",
    ],
    Content: LocalWebsiteEssentialsArticle,
  },
  {
    slug: "website-mistakes-that-cost-local-businesses-customers",
    title: "Website Mistakes That Cost Local Businesses Customers",
    seoTitle: "Website Mistakes That Lose Local Customers",
    shortTitle: "Website mistakes that lose customers",
    description:
      "Identify the messaging, mobile, speed, form, trust, and accessibility problems that quietly cause local website visitors to leave.",
    category: "Website fundamentals",
    funnel: "Educational",
    primaryTarget: "website mistakes that cost local businesses customers",
    secondaryTargets: [
      "small business website mistakes",
      "local website conversion problems",
      "why website visitors do not contact my business",
    ],
    intent: "Diagnose customer-experience and conversion problems.",
    nextStep: "/des-moines-web-design",
    publishedAt: "2026-08-09",
    tableOfContents: [
      { id: "message", label: "Unclear message" },
      { id: "friction", label: "Contact friction" },
      { id: "mobile-speed", label: "Mobile and speed" },
      { id: "trust-access", label: "Trust and accessibility" },
      { id: "audit", label: "A quick audit" },
    ],
    relatedSlugs: [
      "what-should-a-local-business-website-include",
      "why-isnt-my-business-website-showing-up-on-google",
      "how-to-choose-a-web-designer-in-des-moines",
    ],
    Content: WebsiteMistakesArticle,
  },
  {
    slug: "how-long-does-it-take-to-build-a-small-business-website",
    title: "How Long Does It Take to Build a Small Business Website?",
    seoTitle: "Small Business Website Timeline Guide",
    shortTitle: "Small business website timelines",
    description:
      "Learn which scope, content, feedback, functionality, and launch decisions determine how long a small business website takes to build.",
    category: "Website fundamentals",
    funnel: "Educational",
    primaryTarget: "how long does it take to build a small business website",
    secondaryTargets: [
      "website design timeline",
      "small business website project timeline",
      "how long does web design take",
    ],
    intent: "Set realistic expectations for a website project timeline.",
    nextStep: "/resources/how-to-choose-a-web-designer-in-des-moines",
    publishedAt: "2026-08-09",
    tableOfContents: [
      { id: "range", label: "A realistic range" },
      { id: "phases", label: "The project phases" },
      { id: "delays", label: "What causes delays" },
      { id: "prepare", label: "How to prepare" },
      { id: "questions", label: "Timeline questions" },
    ],
    relatedSlugs: [
      "how-much-does-a-website-cost-in-des-moines",
      "what-should-a-local-business-website-include",
      "how-to-choose-a-web-designer-in-des-moines",
    ],
    Content: SmallBusinessWebsiteTimelineArticle,
  },
  {
    slug: "why-isnt-my-business-website-showing-up-on-google",
    title: "Why Isn’t My Business Website Showing Up on Google?",
    seoTitle: "Why Your Business Website Isn’t on Google",
    shortTitle: "Why your website is not on Google",
    description:
      "A plain-language guide to indexing, crawlability, local relevance, Google Business Profile, authority, competition, and technical SEO.",
    category: "Website fundamentals",
    funnel: "Educational",
    primaryTarget: "why isn't my business website showing up on Google",
    secondaryTargets: [
      "business website not on Google",
      "local business not showing in search",
      "website indexing problems",
    ],
    intent: "Diagnose why a business website is absent or underperforming in search.",
    nextStep: "/resources/what-should-a-local-business-website-include",
    publishedAt: "2026-08-09",
    tableOfContents: [
      { id: "indexed", label: "Check whether it is indexed" },
      { id: "crawlability", label: "Check crawlability" },
      { id: "relevance", label: "Build local relevance" },
      { id: "authority", label: "Competition and authority" },
      { id: "next-steps", label: "What to do next" },
    ],
    relatedSlugs: [
      "what-should-a-local-business-website-include",
      "website-mistakes-that-cost-local-businesses-customers",
      "does-your-small-business-need-a-website-in-2026",
    ],
    Content: WebsiteNotOnGoogleArticle,
  },
];

export const getResource = (slug: string) =>
  resources.find((resource) => resource.slug === slug);

export const getRelatedResources = (article: ResourceArticle) =>
  article.relatedSlugs
    .map((slug) => getResource(slug))
    .filter((resource): resource is ResourceArticle => Boolean(resource));
