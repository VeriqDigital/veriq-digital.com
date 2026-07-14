import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type PageMetadataOptions = {
  title?: string;
  description: string;
  path: string;
  image?: {
    url: string;
    alt: string;
  };
};

export function createPageMetadata({
  title,
  description,
  path,
  image,
}: PageMetadataOptions): Metadata {
  const socialTitle = title
    ? `${title} | ${siteConfig.name}`
    : siteConfig.defaultTitle;
  const openGraphImage = image ?? {
    url: "/opengraph-image",
    alt: `${siteConfig.name} — web design and custom software studio`,
  };
  const twitterImage = image ?? {
    url: "/twitter-image",
    alt: openGraphImage.alt,
  };

  return {
    title: title ? title : { absolute: siteConfig.defaultTitle },
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: siteConfig.name,
      images: [openGraphImage],
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [twitterImage],
    },
  };
}
