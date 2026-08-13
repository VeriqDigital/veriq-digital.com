import type { ComponentType } from "react";
import {
  ChooseWebDesignerArticle,
  CustomWebsiteVsTemplateArticle,
  LocalDesignerVsAgencyArticle,
  LocalWebsiteEssentialsArticle,
  ProfessionalSmallBusinessWebsiteArticle,
  SmallBusinessWebsiteCostArticle,
  SmallBusinessWebsiteTimelineArticle,
  SmallBusinessWebsiteValueArticle,
  SignsWebsiteIsOutdatedArticle,
  WebDesignerVsWebsiteBuilderArticle,
  WebsiteCostArticle,
  WebsiteLooksBadOnMobileArticle,
  WebsiteMistakesArticle,
  WebsiteNotGettingLeadsArticle,
  WebsiteNotOnGoogleArticle,
  WebsiteRedesignCostArticle,
  WebsiteRedesignVsRebuildArticle,
  WhyWebsiteIsSlowArticle,
} from "@/content/resources";

export type ResourceCategory = "Buying guide" | "Website fundamentals";
export type ResourceFunnel = "Educational" | "Commercial investigation";

export const resourceTopics = [
  {
    name: "Web Design",
    shortName: "Web Design",
    id: "web-design",
    description:
      "Planning, evaluating, and improving websites that support real business goals.",
  },
  {
    name: "SEO & Digital Marketing",
    shortName: "SEO & Marketing",
    id: "seo-digital-marketing",
    description:
      "Search visibility, discoverability, content, and sustainable digital growth.",
  },
  {
    name: "UI/UX & Conversion",
    shortName: "UI/UX",
    id: "ui-ux-conversion",
    description:
      "Clearer digital experiences that help visitors understand, trust, and act.",
  },
  {
    name: "Web Development",
    shortName: "Web Development",
    id: "web-development",
    description:
      "Technical foundations, performance, integrations, and custom functionality.",
  },
  {
    name: "Branding & Digital Presence",
    shortName: "Branding",
    id: "branding-digital-presence",
    description:
      "How businesses present themselves and build trust across digital channels.",
  },
] as const;

export type ResourceTopic = (typeof resourceTopics)[number]["name"];

export type ResourceArticle = {
  slug: string;
  title: string;
  seoTitle: string;
  shortTitle: string;
  description: string;
  topic: ResourceTopic;
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
 * The small-business service page solely owns non-geographic transactional
 * phrases for small-business website design and development. Resources may
 * support that page, but must not target the service phrase as their primary
 * intent. The website-redesign service page solely owns transactional
 * website-redesign phrases. Redesign resources own only their diagnostic,
 * comparison, or cost questions.
 */
export const resources: readonly ResourceArticle[] = [
  {
    slug: "how-much-does-a-small-business-website-cost",
    title: "How Much Does a Small Business Website Cost?",
    seoTitle: "Small Business Website Cost: A Practical Guide",
    shortTitle: "Small business website costs",
    description:
      "Understand small-business website costs across DIY, professionally built platform sites, custom development, functionality, and ongoing ownership.",
    topic: "Web Design",
    category: "Buying guide",
    funnel: "Commercial investigation",
    primaryTarget: "small business website cost",
    secondaryTargets: [
      "how much does a small business website cost",
      "small business website pricing",
      "cost to build a small business website",
      "professional website cost",
    ],
    intent:
      "Compare website investment levels and total ownership costs before defining a project.",
    nextStep: "/small-business-web-design",
    publishedAt: "2026-08-11",
    tableOfContents: [
      { id: "useful-range", label: "A realistic market range" },
      { id: "approaches", label: "Four planning bands" },
      { id: "project-cost", label: "Project cost drivers" },
      { id: "ongoing-cost", label: "Ongoing ownership costs" },
      { id: "budget", label: "Build a first-year budget" },
    ],
    relatedSlugs: [
      "web-designer-vs-website-builder-for-small-business",
      "custom-website-vs-template-for-small-business",
      "how-much-does-a-website-cost-in-des-moines",
    ],
    Content: SmallBusinessWebsiteCostArticle,
  },
  {
    slug: "how-much-does-a-website-cost-in-des-moines",
    title: "How Much Does a Website Cost in Des Moines?",
    seoTitle: "Website Cost in Des Moines: A Practical Guide",
    shortTitle: "Website costs in Des Moines",
    description:
      "A practical guide to website design costs in Des Moines, including the scope, content, functionality, and support choices that shape a proposal.",
    topic: "Web Design",
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
    topic: "Web Design",
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
    topic: "Web Design",
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
    slug: "web-designer-vs-website-builder-for-small-business",
    title: "Web Designer vs. Website Builder: What Should a Small Business Use?",
    seoTitle: "Web Designer vs. Website Builder for Small Business",
    shortTitle: "Web designer vs. website builder",
    description:
      "Compare DIY website builders and professional web designers across cost, time, quality, flexibility, maintenance, and business complexity.",
    topic: "Web Design",
    category: "Buying guide",
    funnel: "Commercial investigation",
    primaryTarget: "web designer vs website builder",
    secondaryTargets: [
      "hire web designer vs build website myself",
      "professional website vs website builder",
      "should I hire a web designer",
      "build my own business website",
    ],
    intent:
      "Decide whether to build a business website independently or hire professional help.",
    nextStep: "/small-business-web-design",
    publishedAt: "2026-08-11",
    tableOfContents: [
      { id: "real-choice", label: "The real choice" },
      { id: "comparison", label: "Responsibility comparison" },
      { id: "diy-fit", label: "When DIY fits" },
      { id: "designer-fit", label: "When a designer fits" },
      { id: "decision", label: "Choose an operating model" },
    ],
    relatedSlugs: [
      "custom-website-vs-template-for-small-business",
      "how-much-does-a-small-business-website-cost",
      "how-to-choose-a-web-designer-in-des-moines",
    ],
    Content: WebDesignerVsWebsiteBuilderArticle,
  },
  {
    slug: "custom-website-vs-template-for-small-business",
    title: "Custom Website vs. Template: What Does a Small Business Need?",
    seoTitle: "Custom Website vs. Template for Small Business",
    shortTitle: "Custom website vs. template",
    description:
      "Learn when a template or managed platform is enough and when custom website design or development creates meaningful business value.",
    topic: "Web Design",
    category: "Buying guide",
    funnel: "Commercial investigation",
    primaryTarget: "custom website vs template",
    secondaryTargets: [
      "template website vs custom website",
      "custom website benefits",
      "does my business need a custom website",
      "custom website for small business",
    ],
    intent:
      "Choose an implementation level based on business requirements, constraints, and growth plans.",
    nextStep: "/small-business-web-design",
    publishedAt: "2026-08-11",
    tableOfContents: [
      { id: "terms", label: "Define the spectrum" },
      { id: "template-fit", label: "When a template fits" },
      { id: "custom-fit", label: "When custom work fits" },
      { id: "tradeoffs", label: "Long-term tradeoffs" },
      { id: "decision", label: "Make the decision" },
    ],
    relatedSlugs: [
      "web-designer-vs-website-builder-for-small-business",
      "how-much-does-a-small-business-website-cost",
      "how-long-does-it-take-to-build-a-small-business-website",
    ],
    Content: CustomWebsiteVsTemplateArticle,
  },
  {
    slug: "does-your-small-business-need-a-website-in-2026",
    title: "Does Your Small Business Still Need a Website in 2026?",
    seoTitle: "Does a Small Business Need a Website in 2026?",
    shortTitle: "Does your business need a website?",
    description:
      "A practical look at what a business website still does that social profiles and marketplace listings cannot—and when a simple site is enough.",
    topic: "Branding & Digital Presence",
    category: "Website fundamentals",
    funnel: "Educational",
    primaryTarget: "does a small business need a website in 2026",
    secondaryTargets: [
      "is a website necessary for a small business",
      "website vs social media for small business",
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
    topic: "Web Design",
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
    topic: "UI/UX & Conversion",
    category: "Website fundamentals",
    funnel: "Educational",
    primaryTarget: "website mistakes that cost local businesses customers",
    secondaryTargets: [
      "small business website mistakes",
      "common local business website mistakes",
      "website usability mistakes",
      "why website visitors do not contact my business",
    ],
    intent: "Diagnose customer-experience and conversion problems.",
    nextStep: "/website-redesign",
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
    slug: "why-isnt-my-website-getting-leads",
    title: "Why Isn’t My Website Getting Leads?",
    seoTitle: "Why Your Website Isn’t Generating Leads",
    shortTitle: "Why your website is not getting leads",
    description:
      "Diagnose whether weak website lead generation comes from traffic, search intent, messaging, trust, mobile friction, forms, or measurement.",
    topic: "UI/UX & Conversion",
    category: "Website fundamentals",
    funnel: "Educational",
    primaryTarget: "why isn't my website getting leads",
    secondaryTargets: [
      "website not generating leads",
      "website not converting",
      "how to get more leads from website",
      "website conversion problems",
    ],
    intent:
      "Identify where a website lead path is failing before choosing a redesign or marketing fix.",
    nextStep: "/website-redesign",
    publishedAt: "2026-08-11",
    tableOfContents: [
      { id: "diagnose", label: "Find the break in the path" },
      { id: "traffic", label: "Traffic quality and intent" },
      { id: "message", label: "Offer and audience clarity" },
      { id: "trust-friction", label: "Trust and contact friction" },
      { id: "measurement", label: "Measure before redesigning" },
    ],
    relatedSlugs: [
      "website-mistakes-that-cost-local-businesses-customers",
      "why-isnt-my-business-website-showing-up-on-google",
      "what-makes-a-small-business-website-look-professional",
    ],
    Content: WebsiteNotGettingLeadsArticle,
  },
  {
    slug: "what-makes-a-small-business-website-look-professional",
    title: "What Makes a Small Business Website Look Professional?",
    seoTitle: "What Makes a Small Business Website Professional?",
    shortTitle: "What makes a website look professional",
    description:
      "Learn how hierarchy, typography, consistency, imagery, trust details, mobile behavior, and performance shape a professional business website.",
    topic: "Branding & Digital Presence",
    category: "Website fundamentals",
    funnel: "Educational",
    primaryTarget: "what makes a website look professional",
    secondaryTargets: [
      "professional small business website",
      "how to make a business website look professional",
      "professional website design",
    ],
    intent:
      "Understand the visual, content, and technical qualities that make a business website feel credible.",
    nextStep: "/small-business-web-design",
    publishedAt: "2026-08-11",
    tableOfContents: [
      { id: "coherence", label: "Professional means coherent" },
      { id: "hierarchy", label: "Clear visual hierarchy" },
      { id: "consistency", label: "Consistent design system" },
      { id: "imagery-trust", label: "Imagery and trust" },
      { id: "mobile-performance", label: "Mobile and performance" },
    ],
    relatedSlugs: [
      "what-should-a-local-business-website-include",
      "website-mistakes-that-cost-local-businesses-customers",
      "why-isnt-my-website-getting-leads",
    ],
    Content: ProfessionalSmallBusinessWebsiteArticle,
  },
  {
    slug: "how-long-does-it-take-to-build-a-small-business-website",
    title: "How Long Does It Take to Build a Small Business Website?",
    seoTitle: "Small Business Website Timeline Guide",
    shortTitle: "Small business website timelines",
    description:
      "Learn which scope, content, feedback, functionality, and launch decisions determine how long a small business website takes to build.",
    topic: "Web Design",
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
    topic: "SEO & Digital Marketing",
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
  {
    slug: "signs-your-website-is-outdated",
    title: "Signs Your Website Is Outdated",
    seoTitle: "Signs Your Website Is Outdated",
    shortTitle: "Signs your website is outdated",
    description:
      "Identify when an existing website no longer reflects the business, serves customers well, supports updates, or fits the next stage of growth.",
    topic: "Branding & Digital Presence",
    category: "Website fundamentals",
    funnel: "Educational",
    primaryTarget: "signs your website is outdated",
    secondaryTargets: [
      "outdated website",
      "does my website need a redesign",
      "when should I redesign my website",
      "signs you need a new website",
    ],
    intent:
      "Recognize evidence that a current website needs focused improvement or broader redesign.",
    nextStep: "/resources/website-redesign-vs-rebuild",
    publishedAt: "2026-08-12",
    tableOfContents: [
      { id: "business", label: "Business mismatch" },
      { id: "customers", label: "Customer problems" },
      { id: "operations", label: "Editing and maintenance" },
      { id: "measurement", label: "Measurement and growth" },
      { id: "age", label: "Age is not the test" },
      { id: "next-step", label: "Choose the next step" },
    ],
    relatedSlugs: [
      "website-redesign-vs-rebuild",
      "website-mistakes-that-cost-local-businesses-customers",
      "why-isnt-my-website-getting-leads",
    ],
    Content: SignsWebsiteIsOutdatedArticle,
  },
  {
    slug: "why-is-my-website-slow",
    title: "Why Is My Website Slow?",
    seoTitle: "Why Your Website Is Slow",
    shortTitle: "Why your website is slow",
    description:
      "Understand how media, scripts, third-party tools, hosting, plugins, and architecture create a slow business website—and what to fix first.",
    topic: "Web Design",
    category: "Website fundamentals",
    funnel: "Educational",
    primaryTarget: "why is my website slow",
    secondaryTargets: [
      "slow business website",
      "website performance problems",
      "improve website speed",
    ],
    intent:
      "Diagnose accessible website performance causes before choosing optimization or redesign.",
    nextStep: "/resources/website-redesign-vs-rebuild",
    publishedAt: "2026-08-12",
    tableOfContents: [
      { id: "measure", label: "Define the slowdown" },
      { id: "media", label: "Media and fonts" },
      { id: "scripts", label: "Scripts and third parties" },
      { id: "platform", label: "Platform and architecture" },
      { id: "decision", label: "Optimize or redesign" },
    ],
    relatedSlugs: [
      "website-looks-bad-on-mobile",
      "website-redesign-vs-rebuild",
      "website-mistakes-that-cost-local-businesses-customers",
    ],
    Content: WhyWebsiteIsSlowArticle,
  },
  {
    slug: "website-looks-bad-on-mobile",
    title: "Why Does My Website Look Bad on Mobile?",
    seoTitle: "Why Your Website Looks Bad on Mobile",
    shortTitle: "Why your website looks bad on mobile",
    description:
      "Find the responsive layout, navigation, typography, media, form, and performance problems that make a business website difficult to use on phones.",
    topic: "UI/UX & Conversion",
    category: "Website fundamentals",
    funnel: "Educational",
    primaryTarget: "website looks bad on mobile",
    secondaryTargets: [
      "website not mobile friendly",
      "mobile website problems",
      "responsive website problems",
    ],
    intent:
      "Diagnose recurring mobile usability failures and decide whether to repair a component or redesign the system.",
    nextStep: "/resources/website-redesign-vs-rebuild",
    publishedAt: "2026-08-12",
    tableOfContents: [
      { id: "responsive", label: "Responsive layout" },
      { id: "navigation", label: "Navigation and touch" },
      { id: "content", label: "Type, media, and tables" },
      { id: "forms", label: "Mobile forms" },
      { id: "performance", label: "Mobile performance" },
      { id: "decision", label: "Repair or redesign" },
    ],
    relatedSlugs: [
      "why-is-my-website-slow",
      "website-mistakes-that-cost-local-businesses-customers",
      "website-redesign-vs-rebuild",
    ],
    Content: WebsiteLooksBadOnMobileArticle,
  },
  {
    slug: "website-redesign-vs-rebuild",
    title: "Website Redesign vs. Rebuild: Which Do You Need?",
    seoTitle: "Website Redesign vs. Rebuild",
    shortTitle: "Website redesign vs. rebuild",
    description:
      "Compare focused improvements, redesign, restructuring, migration, and rebuilding based on platform limits, technical debt, content, and business needs.",
    topic: "Web Design",
    category: "Buying guide",
    funnel: "Commercial investigation",
    primaryTarget: "website redesign vs rebuild",
    secondaryTargets: [
      "redesign or rebuild website",
      "should I redesign my website",
      "should I rebuild my website",
      "update vs rebuild website",
    ],
    intent:
      "Choose the smallest complete improvement path for an existing website.",
    nextStep: "/resources/how-much-does-a-website-redesign-cost",
    publishedAt: "2026-08-12",
    tableOfContents: [
      { id: "terms", label: "Define the paths" },
      { id: "fix", label: "When to fix" },
      { id: "redesign", label: "When to redesign" },
      { id: "rebuild", label: "When to rebuild" },
      { id: "decision", label: "Make the decision" },
    ],
    relatedSlugs: [
      "signs-your-website-is-outdated",
      "how-much-does-a-website-redesign-cost",
      "custom-website-vs-template-for-small-business",
    ],
    Content: WebsiteRedesignVsRebuildArticle,
  },
  {
    slug: "how-much-does-a-website-redesign-cost",
    title: "How Much Does a Website Redesign Cost?",
    seoTitle: "Website Redesign Cost: A Practical Guide",
    shortTitle: "Website redesign cost",
    description:
      "Learn how current-site condition, content, design, migration, integrations, redirects, testing, and support shape website redesign pricing.",
    topic: "Web Design",
    category: "Buying guide",
    funnel: "Commercial investigation",
    primaryTarget: "website redesign cost",
    secondaryTargets: [
      "how much does a website redesign cost",
      "website redesign pricing",
      "cost to redesign a website",
      "small business website redesign cost",
      "website redesign price",
    ],
    intent:
      "Understand redesign-specific cost drivers before requesting a scoped proposal.",
    nextStep: "/website-redesign",
    publishedAt: "2026-08-12",
    tableOfContents: [
      { id: "why-prices-vary", label: "Why prices vary" },
      { id: "cost-drivers", label: "Cost drivers" },
      { id: "migration", label: "Migration and SEO work" },
      { id: "proposal", label: "Compare proposals" },
      { id: "budget", label: "Plan the budget" },
    ],
    relatedSlugs: [
      "website-redesign-vs-rebuild",
      "how-much-does-a-small-business-website-cost",
      "how-long-does-it-take-to-build-a-small-business-website",
    ],
    Content: WebsiteRedesignCostArticle,
  },
];

export const getResource = (slug: string) =>
  resources.find((resource) => resource.slug === slug);

export const getRelatedResources = (article: ResourceArticle) =>
  article.relatedSlugs
    .map((slug) => getResource(slug))
    .filter((resource): resource is ResourceArticle => Boolean(resource));
