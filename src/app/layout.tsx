import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import {
  personSchema,
  organizationSchema,
  localBusinessSchema,
  webSiteSchema,
  topicEntitySchemas,
  reviewSchema,
  schemaGraph,
} from "@/lib/schema";
import { TESTIMONIALS } from "@/lib/testimonial-data";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SEO Consultant Reading | 150%+ Avg Traffic Growth | Sunny Patel",
  description:
    "Reading-based SEO consultant with 15+ years experience. Clients see 150-280% organic traffic growth. Free 30-min consultation, no contracts. Book today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `html{color-scheme:dark}.dark{--background:#050507;--foreground:oklch(0.95 0 0)}body{background-color:#050507;color:oklch(0.95 0 0);-webkit-font-smoothing:antialiased}` }} />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: schemaGraph(
              personSchema(),
              organizationSchema(),
              localBusinessSchema(),
              webSiteSchema(),
              ...topicEntitySchemas(),
              ...(TESTIMONIALS.length > 0 ? [reviewSchema(TESTIMONIALS)] : [])
            ),
          }}
        />
        {children}
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
