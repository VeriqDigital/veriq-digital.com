import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import DevelopmentWebVitals from "@/components/analytics/DevelopmentWebVitals";
import MetaPixel from "@/components/analytics/MetaPixel";
import CursorGlow from "@/components/ui/CursorGlow";
import Footer from "@/components/layout/Footer";
import FloatingBookingCta from "@/components/layout/FloatingBookingCta";
import Navbar from "@/components/layout/Navbar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { siteConfig } from "@/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-heading",
});

const isPreviewDeployment = process.env.VERCEL_ENV === "preview";
const isDevelopment = process.env.NODE_ENV === "development";

const themeInitScript = `try{var root=document.documentElement;var savedTheme=localStorage.getItem("theme");var theme=savedTheme==="light"||savedTheme==="dark"?savedTheme:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var themeColor=theme==="dark"?"#1a1c1e":"#f7f7f5";root.dataset.theme=theme;root.style.backgroundColor=themeColor;root.style.colorScheme=theme;var themeColorMeta=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<themeColorMeta.length;i++){themeColorMeta[i].setAttribute("content",themeColor)}window.addEventListener("load",function(){root.style.removeProperty("background-color");root.style.removeProperty("color-scheme")},{once:true})}catch{document.documentElement.dataset.theme=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}`;

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
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1c1e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
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
        <ThemeToggle />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
