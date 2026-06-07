"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { List, X } from "lucide-react";
import { cn } from "@/lib/utils";

type HeadingData = {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
};

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="absolute left-0 top-0 h-full w-[2px] rounded-full bg-white/[0.06]">
      <motion.div
        className="w-full rounded-full bg-brand"
        initial={{ height: "0%" }}
        animate={{ height: `${percentage}%` }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      />
    </div>
  );
}

type SidebarTOCProps = {
  selector?: string;
};

export function DynamicIslandTOC({
  selector = "article h1, article h2, article h3, article h4, .prose h1, .prose h2, .prose h3, .prose h4, [data-toc]",
}: SidebarTOCProps) {
  const [headings, setHeadings] = useState<HeadingData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const getHeadings = () => {
      const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];

      const validHeadings = elements
        .filter((el) => !el.hasAttribute("data-toc-ignore"))
        .map((el, index) => {
          if (!el.id) {
            const generatedId =
              el.textContent
                ?.toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "") || `toc-heading-${index}`;
            el.id = generatedId;
          }

          const depthAttr = el.getAttribute("data-toc-depth");
          let level = 2;
          if (depthAttr) {
            level = parseInt(depthAttr, 10);
          } else {
            const tagName = el.tagName.toUpperCase();
            if (tagName.startsWith("H") && tagName.length === 2) {
              level = parseInt(tagName[1], 10);
            }
          }

          const text = el.getAttribute("data-toc-title") || el.textContent || "Section";
          return { id: el.id, text, level, element: el };
        });

      validHeadings.sort((a, b) =>
        a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );

      setHeadings(validHeadings);
    };

    const timer = setTimeout(getHeadings, 100);
    return () => clearTimeout(timer);
  }, [selector]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollY / (docHeight - winHeight);

      setVisible(scrollPercent > 0.05 && scrollPercent < 0.95);

      let currentActiveId: string | null = null;
      for (const heading of headings) {
        const top = heading.element.getBoundingClientRect().top;
        if (top <= 120) {
          currentActiveId = heading.id;
        } else {
          break;
        }
      }

      if (!currentActiveId && headings.length > 0) {
        currentActiveId = headings[0].id;
      }

      setActiveId(currentActiveId);
      setProgress(scrollPercent > 0 ? Math.min(100, Math.max(0, scrollPercent * 100)) : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const minLevel = useMemo(() => {
    if (headings.length === 0) return 1;
    return Math.min(...headings.map((h) => h.level));
  }, [headings]);

  if (headings.length === 0) return null;

  const tocList = (
    <div className="flex flex-col gap-0.5">
      {headings.map((h) => {
        const isActive = activeId === h.id;
        const indentLevel = Math.max(0, h.level - minLevel);
        const paddingLeft = indentLevel * 12 + 8;

        return (
          <button
            key={h.id}
            onClick={() => {
              const yOffset = -80;
              const y = h.element.getBoundingClientRect().top + window.scrollY + yOffset;
              window.scrollTo({ top: y, behavior: "smooth" });
              setMobileOpen(false);
            }}
            style={{ paddingLeft: `${paddingLeft}px` }}
            className={cn(
              "group flex w-full items-center rounded-md py-1.5 pr-2 text-left text-[13px] leading-snug transition-all duration-200",
              isActive
                ? "text-brand font-medium"
                : "text-muted-foreground/60 hover:text-muted-foreground",
            )}
          >
            <span className="overflow-hidden text-ellipsis whitespace-nowrap transition-transform duration-200 group-hover:translate-x-0.5">
              {h.text}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — right side */}
      <AnimatePresence>
        {visible && (
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-6 top-1/2 z-40 hidden max-h-[60vh] w-52 -translate-y-1/2 xl:block 2xl:right-10 2xl:w-56"
          >
            <div className="relative rounded-xl border border-white/[0.06] bg-[#08080d]/90 p-4 pl-5 shadow-xl backdrop-blur-md">
              <ProgressBar percentage={progress} />
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/65">
                On this page
              </p>
              <div className="max-h-[calc(60vh-4rem)] overflow-y-auto overscroll-contain">
                {tocList}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile pill — top-right */}
      <AnimatePresence>
        {visible && !mobileOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(true)}
            className="fixed right-4 top-20 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#08080d]/95 shadow-lg backdrop-blur-md xl:hidden"
            aria-label="Table of contents"
          >
            <List className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px] xl:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-[9999] h-full w-72 border-l border-white/[0.06] bg-[#08080d]/98 p-5 pt-6 shadow-2xl backdrop-blur-xl xl:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/65">
                  On this page
                </p>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-muted-foreground/65 transition-colors hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain pl-3">
                <ProgressBar percentage={progress} />
                {tocList}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
