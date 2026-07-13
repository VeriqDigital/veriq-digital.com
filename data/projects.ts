export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  image: string;
  imageAlt: string;
  liveUrl: string;
  summary: string;
  about: string;
  challenge: string;
  outcome: string;
  timeframe: string;
  team: string;
  services: readonly string[];
};

export const projects: readonly Project[] = [
  {
    slug: "iron-palace",
    title: "Iron Palace",
    category: "Gym concept website",
    year: "Demo",
    image: "/work/iron-palace.png",
    imageAlt:
      "Iron Palace gym website with a dark architectural hero and bold headline",
    liveUrl: "https://iron-palace-henna.vercel.app/",
    summary:
      "A cinematic gym concept designed to make the experience feel like a destination before someone ever walks through the door.",
    about:
      "Iron Palace is a self-directed concept website exploring how a high-end strength facility could present its identity, coaches, events, tours, and day-pass experience online.",
    challenge:
      "Most gym websites lead with interchangeable equipment photos and crowded membership offers. This concept needed a stronger sense of place while still keeping the practical paths to joining, scheduling a tour, and exploring the facility easy to find.",
    outcome:
      "The finished demo pairs a dramatic, editorial visual system with focused calls to action and a clear multi-page structure. It demonstrates how a local fitness brand can feel premium without sacrificing usability.",
    timeframe: "Concept build",
    team: "Solo project",
    services: ["Creative direction", "Web design", "Frontend development", "Responsive design"],
  },
  {
    slug: "abc-auto-repair",
    title: "ABC Auto Repair",
    category: "Auto repair demo website",
    year: "Demo",
    image: "/work/abc-auto.png",
    imageAlt:
      "ABC Auto Repair website with a repair-shop hero and orange call-to-action",
    liveUrl: "https://auto-repair-demo-neon.vercel.app/",
    summary:
      "A practical, conversion-focused auto repair demo that builds trust and moves customers toward requesting a quote.",
    about:
      "ABC Auto Repair is a self-directed full-site demo for a neighborhood repair shop. It combines a customer-facing marketing experience with clear pathways for service information, quote requests, login, and administration.",
    challenge:
      "Repair customers arrive with urgency and skepticism. The experience needed to establish credibility immediately, explain a broad service offering without overwhelming people, and make the next step obvious on every screen.",
    outcome:
      "The demo uses a strong service hierarchy, trust indicators, quote-focused calls to action, and dedicated customer and admin entry points. It shows how a traditional local business can feel dependable and current online.",
    timeframe: "Concept build",
    team: "Solo project",
    services: ["UX/UI design", "Web development", "Quote flow", "Responsive design"],
  },
] as const;

export const getProject = (slug: string) =>
  projects.find((project) => project.slug === slug);
