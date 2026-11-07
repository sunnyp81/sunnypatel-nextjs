"use client";

import Image from "next/image";

export function ProjectCover({
  title,
  industry,
  image,
  result,
}: {
  title: string;
  tags?: readonly string[] | null;
  industry?: string | null;
  image?: { src: string; alt: string } | null;
  result?: { value: string; label: string } | null;
}) {
  if (image) {
    return (
      <div className="relative w-full overflow-hidden rounded-t-xl bg-[#050507]" style={{ aspectRatio: "1200 / 630" }}>
        <Image
          src={image.src}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-cover"
        />
        <h3 className="sr-only">{title}</h3>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-t-xl">
      <div className="flex flex-col px-5 pb-1 pt-6">
        {result && (
          <>
            <span className="cover-num">{result.value}</span>
            <span className="cover-num-label">{result.label}</span>
          </>
        )}
        {industry && (
          <span
            className="lit-label lit-label--sm mb-2 w-fit"
          >
            {industry}
          </span>
        )}
        <h3
          className="text-[17px] font-bold leading-snug text-ink-strong dark:text-white/90"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h3>
      </div>
    </div>
  );
}
