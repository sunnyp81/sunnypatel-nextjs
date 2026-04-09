"use client";

import { useState, useRef, useCallback } from "react";

interface CompressedImage {
  originalFile: File;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  compressedBlob: Blob;
  compressedSize: number;
  compressedWidth: number;
  compressedHeight: number;
  originalPreviewUrl: string;
  compressedPreviewUrl: string;
  outputFilename: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getMimeType(format: string): string {
  switch (format) {
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "png":
      return "image/png";
    default:
      return "image/jpeg";
  }
}

function getDefaultFormat(file: File): string {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpeg";
}

function getExtension(format: string): string {
  switch (format) {
    case "jpeg":
      return ".jpg";
    case "webp":
      return ".webp";
    case "png":
      return ".png";
    default:
      return ".jpg";
  }
}

export default function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<"auto" | "jpeg" | "webp" | "png">("auto");
  const [maxDim, setMaxDim] = useState<string>("");
  const [results, setResults] = useState<CompressedImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const accepted = Array.from(newFiles)
      .filter((f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type))
      .slice(0, 20);
    if (accepted.length > 0) {
      setFiles((prev) => {
        const combined = [...prev, ...accepted];
        return combined.slice(0, 20);
      });
      setResults([]);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const compressImage = (file: File): Promise<CompressedImage> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const originalUrl = URL.createObjectURL(file);
      img.src = originalUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        const maxDimNum = maxDim ? parseInt(maxDim, 10) : 0;

        if (maxDimNum && (w > maxDimNum || h > maxDimNum)) {
          const ratio = Math.min(maxDimNum / w, maxDimNum / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);

        const format = outputFormat === "auto" ? getDefaultFormat(file) : outputFormat;
        const mimeType = getMimeType(format);
        const qualityValue = format === "png" ? undefined : quality / 100;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }

            const compressedUrl = URL.createObjectURL(blob);
            const baseName = file.name.replace(/\.[^.]+$/, "");
            const ext = getExtension(format);

            resolve({
              originalFile: file,
              originalSize: file.size,
              originalWidth: img.width,
              originalHeight: img.height,
              compressedBlob: blob,
              compressedSize: blob.size,
              compressedWidth: w,
              compressedHeight: h,
              originalPreviewUrl: originalUrl,
              compressedPreviewUrl: compressedUrl,
              outputFilename: `${baseName}-compressed${ext}`,
            });
          },
          mimeType,
          qualityValue
        );
      };
      img.onerror = () => reject(new Error(`Failed to load ${file.name}`));
    });
  };

  const compressAll = async () => {
    if (files.length === 0) return;
    setIsCompressing(true);
    setResults([]);

    const compressed: CompressedImage[] = [];
    for (const file of files) {
      try {
        const result = await compressImage(file);
        compressed.push(result);
      } catch (err) {
        console.error("Compression error:", err);
      }
    }

    setResults(compressed);
    setIsCompressing(false);
  };

  const downloadOne = (result: CompressedImage) => {
    const a = document.createElement("a");
    a.href = result.compressedPreviewUrl;
    a.download = result.outputFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    results.forEach((r, i) => {
      setTimeout(() => downloadOne(r), i * 200);
    });
  };

  const clearAll = () => {
    results.forEach((r) => {
      URL.revokeObjectURL(r.originalPreviewUrl);
      URL.revokeObjectURL(r.compressedPreviewUrl);
    });
    setFiles([]);
    setResults([]);
  };

  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalCompressed = results.reduce((sum, r) => sum + r.compressedSize, 0);
  const totalSavings = totalOriginal > 0 ? ((1 - totalCompressed / totalOriginal) * 100).toFixed(1) : "0";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Image Compressor
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-2xl">
          Compress JPEG, PNG, and WebP images entirely in your browser. Reduce file sizes for faster
          page loads and better Core Web Vitals scores.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
          isDragging
            ? "border-[#5B8AEF] bg-[#5B8AEF]/[0.06]"
            : "border-white/[0.12] bg-white/[0.02] hover:border-[#5B8AEF]/40 hover:bg-[#5B8AEF]/[0.03]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground/60"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="mt-4 text-sm font-medium text-foreground">
          Drop images here or click to select
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPEG, PNG, WebP — up to 20 files
        </p>
      </div>

      {/* File count */}
      {files.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {files.length} image{files.length !== 1 ? "s" : ""} selected
          </p>
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Controls */}
      {files.length > 0 && (
        <div className="mt-6 rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Quality */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-[#5B8AEF]"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>10%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Output Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as "auto" | "jpeg" | "webp" | "png")}
                className="w-full rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-sm text-foreground focus:border-[#5B8AEF] focus:outline-none"
              >
                <option value="auto">Auto (same as input)</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
                <option value="png">PNG</option>
              </select>
            </div>

            {/* Max Dimension */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Width/Height (px)
              </label>
              <input
                type="number"
                placeholder="e.g. 1920"
                value={maxDim}
                onChange={(e) => setMaxDim(e.target.value)}
                className="w-full rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#5B8AEF] focus:outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1">Leave empty for original size</p>
            </div>

            {/* Compress Button */}
            <div className="flex items-end">
              <button
                onClick={compressAll}
                disabled={isCompressing}
                className="w-full rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isCompressing ? "Compressing..." : `Compress All (${files.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Bar */}
      {results.length > 0 && (
        <div className="mt-8 rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Images: </span>
                <span className="font-medium text-foreground">{results.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Original: </span>
                <span className="font-medium text-foreground">{formatBytes(totalOriginal)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Compressed: </span>
                <span className="font-medium text-foreground">{formatBytes(totalCompressed)}</span>
              </div>
              <div>
                <span className="rounded-full bg-emerald-500/15 text-emerald-400 px-2 py-0.5 text-xs font-mono">
                  -{totalSavings}%
                </span>
              </div>
            </div>
            <button
              onClick={downloadAll}
              className="rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-opacity hover:opacity-90"
            >
              Download All
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((r, i) => {
            const savings = ((1 - r.compressedSize / r.originalSize) * 100).toFixed(1);
            const didResize =
              r.originalWidth !== r.compressedWidth || r.originalHeight !== r.compressedHeight;
            return (
              <div
                key={i}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Thumbnails */}
                  <div className="flex gap-3 shrink-0">
                    <div className="text-center">
                      <img
                        src={r.originalPreviewUrl}
                        alt="Original"
                        className="h-16 w-16 rounded object-cover border border-white/[0.08]"
                      />
                      <span className="text-[10px] text-muted-foreground mt-1 block">Before</span>
                    </div>
                    <div className="flex items-center text-muted-foreground/40">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <img
                        src={r.compressedPreviewUrl}
                        alt="Compressed"
                        className="h-16 w-16 rounded object-cover border border-white/[0.08]"
                      />
                      <span className="text-[10px] text-muted-foreground mt-1 block">After</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {r.originalFile.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{formatBytes(r.originalSize)} → {formatBytes(r.compressedSize)}</span>
                      {didResize && (
                        <span>
                          {r.originalWidth}×{r.originalHeight} → {r.compressedWidth}×{r.compressedHeight}
                        </span>
                      )}
                      <span className="rounded-full bg-emerald-500/15 text-emerald-400 px-2 py-0.5 text-xs font-mono">
                        -{savings}%
                      </span>
                    </div>
                  </div>

                  {/* Download */}
                  <button
                    onClick={() => downloadOne(r)}
                    className="shrink-0 rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.08]"
                  >
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Page Speed Context */}
      <div className="mt-12 rounded-lg border border-white/[0.08] bg-white/[0.03] p-6">
        <h2
          className="text-lg font-semibold text-foreground mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Why Image Compression Matters for Page Speed
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex gap-3">
            <div className="shrink-0 mt-1 h-5 w-5 rounded-full bg-[#5B8AEF]/15 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-[#5B8AEF]" />
            </div>
            <p className="text-sm text-muted-foreground">
              Images are typically <span className="text-foreground font-medium">50-75%</span> of a
              page&apos;s total weight. Compressing them has the biggest impact on load time.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0 mt-1 h-5 w-5 rounded-full bg-[#5B8AEF]/15 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-[#5B8AEF]" />
            </div>
            <p className="text-sm text-muted-foreground">
              Google&apos;s <span className="text-foreground font-medium">Largest Contentful Paint (LCP)</span> metric
              is often an image — compressing it directly improves Core Web Vitals.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0 mt-1 h-5 w-5 rounded-full bg-[#5B8AEF]/15 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-[#5B8AEF]" />
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">WebP format</span> is 25-35% smaller
              than JPEG at equivalent quality, with broad browser support.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0 mt-1 h-5 w-5 rounded-full bg-[#5B8AEF]/15 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-[#5B8AEF]" />
            </div>
            <p className="text-sm text-muted-foreground">
              All compression happens <span className="text-foreground font-medium">in your browser</span> —
              your images never leave your device. 100% private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
