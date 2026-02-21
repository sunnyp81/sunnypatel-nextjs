import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import {
  personSchema,
  organizationSchema,
  localBusinessSchema,
  webSiteSchema,
  topicEntitySchemas,
  schemaGraph,
} from "@/lib/schema";

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
  title: "Sunny Patel | SEO & AI Consultant | Reading, Berkshire",
  description:
    "SEO consultant and AI strategist helping businesses achieve 150-280% organic traffic growth through entity-based content networks and semantic SEO.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
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
              ...topicEntitySchemas()
            ),
          }}
        />
        {children}
      </body>
    </html>
  );
}
