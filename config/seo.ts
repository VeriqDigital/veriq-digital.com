import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type PageMetadataOptions = {
  title?: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  image?: {
    url: string;
    alt: string;
  };
};

export function createPageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  image,
}: PageMetadataOptions): Metadata {
  const socialTitle = title
    ? `${title} | ${siteConfig.name}`
    : siteConfig.defaultTitle;
  const openGraphImage = image ?? {
    url: "/opengraph-image",
    alt: `${siteConfig.name} — web design, SEO, and conversion partner`,
  };
  const twitterImage = image ?? {
    url: "/twitter-image",
    alt: openGraphImage.alt,
  };

  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? {
          title: socialTitle,
          description,
          url: path,
          siteName: siteConfig.name,
          images: [openGraphImage],
          locale: siteConfig.locale,
          type: "article",
          publishedTime,
        }
      : {
          title: socialTitle,
          description,
          url: path,
          siteName: siteConfig.name,
          images: [openGraphImage],
          locale: siteConfig.locale,
          type: "website",
        };

  return {
    title: title ? title : { absolute: siteConfig.defaultTitle },
    description,
    alternates: {
      canonical: path,
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [twitterImage],
    },
  };
}

const organizationId = `${siteConfig.url}/#organization`;

export const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      alternateName: siteConfig.shortName,
      url: siteConfig.url,
      inLanguage: "en-US",
      publisher: {
        "@id": organizationId,
      },
    },
    {
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.name,
      alternateName: siteConfig.shortName,
      url: siteConfig.url,
      logo: `${siteConfig.url}/icon.svg`,
      image: `${siteConfig.url}/opengraph-image`,
      description: siteConfig.description,
      email: siteConfig.contact.email,
      telephone: siteConfig.contact.phoneE164,
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.location.city,
        addressRegion: siteConfig.location.regionCode,
        addressCountry: siteConfig.location.countryCode,
      },
      areaServed: [
        {
          "@type": "City",
          name: `${siteConfig.location.city}, ${siteConfig.location.region}`,
        },
        {
          "@type": "AdministrativeArea",
          name: "Central Iowa",
        },
      ],
      founder: {
        "@type": "Person",
        name: "Mick Enev",
      },
      sameAs: siteConfig.socialLinks.map((socialLink) => socialLink.href),
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: siteConfig.contact.email,
        telephone: siteConfig.contact.phoneE164,
        areaServed: siteConfig.location.countryCode,
        availableLanguage: "English",
      },
    },
  ],
} as const;

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
