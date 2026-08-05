import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import Script from "next/script";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import CursorGlow from "@/components/ui/CursorGlow";
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
        alt: `${siteConfig.name} — web design and custom software studio`,
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
        <Script id="meta-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1599699858459369');fbq('track','PageView');`}
        </Script>
      </head>
      <body className="flex min-h-full flex-col">
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            className="hidden"
            src="https://www.facebook.com/tr?id=1599699858459369&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <CursorGlow />
        <Navbar />
        {children}
        <Footer />
        <ThemeToggle />
      </body>
    </html>
  );
}
