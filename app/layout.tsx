import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DevelopmentWebVitals from "@/components/analytics/DevelopmentWebVitals";
import MetaPixel from "@/components/analytics/MetaPixel";
import PrivacyAwareAnalytics from "@/components/analytics/PrivacyAwareAnalytics";
import PrivacyAwareSpeedInsights from "@/components/analytics/PrivacyAwareSpeedInsights";
import Footer from "@/components/layout/Footer";
import CursorGlow from "@/components/ui/CursorGlow";
import FloatingBookingCta from "@/components/layout/FloatingBookingCta";
import Navbar from "@/components/layout/Navbar";
import { siteConfig } from "@/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const isPreviewDeployment = process.env.VERCEL_ENV === "preview";
const isDevelopment = process.env.NODE_ENV === "development";

export const metadata: Metadata = {
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  creator: siteConfig.name,
  publisher: siteConfig.name,
  robots: isPreviewDeployment
    ? {
        index: false,
        follow: false,
        nocache: true,
      }
    : undefined,
  openGraph: {
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: "/opengraph-image",
        alt: `${siteConfig.name} — web design, development, and growth partner`,
      },
    ],
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: ["/twitter-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#f6f3ed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {isDevelopment ? <DevelopmentWebVitals /> : null}
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <MetaPixel />
        <CursorGlow />
        <Navbar />
        {children}
        <Footer />
        <FloatingBookingCta />
        <PrivacyAwareAnalytics />
        <PrivacyAwareSpeedInsights />
      </body>
    </html>
  );
}
