import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { projects } from "@/data/projects";
import { resources } from "@/data/resources";

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: siteConfig.url,
    changeFrequency: "monthly",
    priority: 1,
  },
  {
    url: `${siteConfig.url}/services`,
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    url: `${siteConfig.url}/des-moines-web-design`,
    changeFrequency: "monthly",
    priority: 0.95,
  },
  {
    url: `${siteConfig.url}/resources`,
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    url: `${siteConfig.url}/work`,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${siteConfig.url}/about`,
    changeFrequency: "yearly",
    priority: 0.7,
  },
  {
    url: `${siteConfig.url}/contact`,
    changeFrequency: "yearly",
    priority: 0.7,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteConfig.url}/work/${project.slug}`,
    changeFrequency: "yearly",
    priority: 0.7,
    images: [`${siteConfig.url}${project.image}`],
  }));

  const resourceRoutes: MetadataRoute.Sitemap = resources.map((resource) => ({
    url: `${siteConfig.url}/resources/${resource.slug}`,
    lastModified: resource.dateModified ?? resource.publishedAt,
    changeFrequency: "monthly",
    priority: resource.funnel === "Commercial investigation" ? 0.75 : 0.65,
  }));

  return [...staticRoutes, ...resourceRoutes, ...projectRoutes];
}
