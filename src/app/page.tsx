import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Stats } from "@/components/sections/stats";
import { About } from "@/components/sections/about";
import { Portfolio } from "@/components/sections/portfolio";
import { Cta } from "@/components/sections/cta";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { buildMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return buildMetadata({ path: "/" });
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <Navbar />
      <Hero />
      <Services />
      <Stats />
      <About />
      <Portfolio />
      <Cta />
      <Contact />
      <Footer />
    </main>
  );
}
