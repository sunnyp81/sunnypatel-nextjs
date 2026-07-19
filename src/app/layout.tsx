import type { Metadata } from "next";
import { Geist, Hanken_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import {
  personSchema,
  organizationSchema,
  localBusinessSchema,
  webSiteSchema,
  topicEntitySchemas,
  schemaGraph,
} from "@/lib/schema";
import { AnalyticsEvents } from "@/components/analytics-events";
import { ExitIntent } from "@/components/exit-intent";

const geist = Geist({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sunnypatel.co.uk"),
  title: {
    default: "Sunny Patel | SEO Consultant UK",
    template: "%s | Sunny Patel",
  },
  description:
    "Independent SEO consultant. 15+ years helping UK businesses grow organic traffic with semantic SEO, topical authority, and AI search. Free initial consultation, no contracts.",
  openGraph: {
    type: "website",
    siteName: "Sunny Patel, SEO Consultant",
    locale: "en_GB",
    url: "https://sunnypatel.co.uk",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@sunnypat81",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className="dark scroll-smooth">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `html{color-scheme:dark}.dark{--background:#050507;--foreground:oklch(0.95 0 0)}body{background-color:#050507;color:oklch(0.95 0 0);-webkit-font-smoothing:antialiased}` }} />
      </head>
      <body
        className={`${geist.variable} ${hankenGrotesk.variable} antialiased`}
      >
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: schemaGraph(
              personSchema(),
              organizationSchema(),
              localBusinessSchema(),
              webSiteSchema(),
              ...topicEntitySchemas()
            ),
          }}
        />
        {children}
        <ExitIntent />
        <AnalyticsEvents />
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-SJRTDNRZG6"
              strategy="afterInteractive"
            />
            <Script id="ga4-config" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-SJRTDNRZG6');
            `}</Script>
          </>
        )}
      </body>
    </html>
  );
}
