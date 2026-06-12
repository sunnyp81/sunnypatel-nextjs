import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
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

const bricolageGrotesque = Bricolage_Grotesque({
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
  title: "SEO Consultant Reading | 150%+ Growth",
  description:
    "Independent SEO consultant in Reading. 15+ years, 150%+ organic growth for UK businesses. Free 30-min consultation, no contracts.",
  openGraph: {
    type: "website",
    siteName: "Sunny Patel — SEO Consultant",
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
        className={`${bricolageGrotesque.variable} ${hankenGrotesk.variable} antialiased`}
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
      </body>
    </html>
  );
}
