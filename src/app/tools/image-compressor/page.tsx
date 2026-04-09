import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import ImageCompressor from "./ImageCompressor";

export function generateMetadata() {
  return {
    title: "Image Compressor for Page Speed | Reduce Image File Size | Sunny Patel",
    description: "Compress images in your browser to improve page load speed. Reduce JPEG and PNG file sizes without losing visible quality. No upload — 100% private.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/image-compressor/" },
  };
}

export default function ImageCompressorPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <ImageCompressor />
      </div>
      <Footer />
    </main>
  );
}
