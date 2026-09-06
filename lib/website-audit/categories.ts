export const auditCategoryRegistry = [
  {
    id: "seo",
    label: "SEO",
    pageLabel: "Search visibility",
    description:
      "Whether search engines can discover, understand, and index the pages that matter.",
    overallWeight: 22,
  },
  {
    id: "performance",
    label: "Performance",
    pageLabel: "Performance",
    description:
      "How quickly useful content appears and whether the experience stays stable as it loads.",
    overallWeight: 20,
  },
  {
    id: "mobile-experience",
    label: "Mobile experience",
    pageLabel: "Mobile experience",
    description:
      "How comfortably visitors can read, navigate, and take action on smaller screens.",
    overallWeight: 15,
  },
  {
    id: "accessibility",
    label: "Accessibility",
    pageLabel: "Accessibility",
    description:
      "Whether structure, contrast, forms, and controls work for a wider range of people.",
    overallWeight: 15,
  },
  {
    id: "conversion-ux",
    label: "Conversion foundations",
    pageLabel: "Conversion foundations",
    description:
      "Detectable action paths, contact routes, form labels, and mobile action usability. This does not assess messaging, visual hierarchy, persuasion, or design quality.",
    overallWeight: 12,
  },
  {
    id: "technical-health",
    label: "Technical health",
    pageLabel: "Technical health",
    description:
      "The response, security, crawl, link, and page foundations that keep a site dependable.",
    overallWeight: 16,
  },
] as const;

export type AuditCategoryId = (typeof auditCategoryRegistry)[number]["id"];

export const auditCategoryIds = auditCategoryRegistry.map(
  (category) => category.id,
) as readonly AuditCategoryId[];

const auditCategoryById = new Map(
  auditCategoryRegistry.map((category) => [category.id, category]),
);

export function getAuditCategory(id: AuditCategoryId) {
  const category = auditCategoryById.get(id);

  if (!category) {
    throw new Error(`Unknown audit category: ${id}`);
  }

  return category;
}

export function isAuditCategoryId(value: string): value is AuditCategoryId {
  return auditCategoryById.has(value as AuditCategoryId);
}
