'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// ── Style constants ────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30';
const labelClass = 'block text-sm font-medium text-foreground mb-1.5';
const cardClass = 'rounded-xl border border-white/[0.06] bg-white/[0.02] p-6';
const btnPrimary =
  'rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] hover:bg-[#4a7be0] transition-colors';
const btnSecondary =
  'rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground hover:bg-white/[0.08] transition-colors';
const urlDisplayClass =
  'rounded-lg bg-[#0d0d14] border border-white/[0.08] p-4 font-mono text-sm break-all';
const templateCardClass =
  'relative rounded-lg border border-white/[0.08] bg-white/[0.03] p-4';

// ── QR Code Generator (canvas-based) ──────────────────────────────────────────

// Minimal QR code encoder for alphanumeric data using canvas
// We use the Google Charts API as a simple, dependency-free approach
function QRCode({ value, size = 200 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!value || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use a simple approach: generate QR via encoding matrix
    // For reliability without external deps, we draw a QR-like pattern using
    // the qrcode generation algorithm via a lightweight inline implementation
    generateQR(value, canvas, size);
    setLoaded(true);
  }, [value, size]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-lg bg-white"
        style={{ imageRendering: 'pixelated' }}
      />
      {loaded && (
        <button
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const link = document.createElement('a');
            link.download = 'google-review-qr.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
          }}
          className={btnSecondary}
        >
          Download QR Code
        </button>
      )}
    </div>
  );
}

// ── Minimal QR Code Generator ─────────────────────────────────────────────────
// Byte-mode QR encoder (version 1-6, error correction L)
// Enough for Google review URLs (~60-80 chars)

function generateQR(text: string, canvas: HTMLCanvasElement, size: number) {
  const data = encodeUTF8(text);
  const version = selectVersion(data.length);
  const ecInfo = EC_TABLE[version];
  const totalDataCodewords = ecInfo.totalData;
  const ecCodewordsPerBlock = ecInfo.ecPerBlock;
  const blocks = ecInfo.blocks;

  // Build data stream
  const bits: number[] = [];
  // Mode indicator: byte = 0100
  pushBits(bits, 0b0100, 4);
  // Character count
  const ccBits = version <= 9 ? 8 : 16;
  pushBits(bits, data.length, ccBits);
  // Data
  for (const b of data) pushBits(bits, b, 8);
  // Terminator
  const totalDataBits = totalDataCodewords * 8;
  const terminatorLen = Math.min(4, totalDataBits - bits.length);
  pushBits(bits, 0, terminatorLen);
  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);
  // Pad codewords
  const padBytes = [0xEC, 0x11];
  let padIdx = 0;
  while (bits.length < totalDataBits) {
    pushBits(bits, padBytes[padIdx % 2], 8);
    padIdx++;
  }

  const dataCodewords = bitsToBytes(bits);

  // Split into blocks and generate EC
  const blockData: number[][] = [];
  const blockEC: number[][] = [];
  let offset = 0;

  for (const block of blocks) {
    for (let i = 0; i < block.count; i++) {
      const slice = dataCodewords.slice(offset, offset + block.dataCodewords);
      offset += block.dataCodewords;
      blockData.push(slice);
      blockEC.push(rsEncode(slice, ecCodewordsPerBlock));
    }
  }

  // Interleave data codewords
  const interleaved: number[] = [];
  const maxDataLen = Math.max(...blockData.map((b) => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of blockData) {
      if (i < block.length) interleaved.push(block[i]);
    }
  }
  // Interleave EC codewords
  for (let i = 0; i < ecCodewordsPerBlock; i++) {
    for (const block of blockEC) {
      if (i < block.length) interleaved.push(block[i]);
    }
  }

  // Create module matrix
  const modSize = 17 + version * 4;
  const matrix: (0 | 1 | null)[][] = Array.from({ length: modSize }, () =>
    Array(modSize).fill(null) as (0 | 1 | null)[]
  );
  const reserved: boolean[][] = Array.from({ length: modSize }, () =>
    Array(modSize).fill(false)
  );

  // Place finder patterns
  placeFinder(matrix, reserved, 0, 0);
  placeFinder(matrix, reserved, modSize - 7, 0);
  placeFinder(matrix, reserved, 0, modSize - 7);

  // Timing patterns
  for (let i = 8; i < modSize - 8; i++) {
    if (!reserved[6][i]) {
      matrix[6][i] = (i % 2 === 0 ? 1 : 0) as 0 | 1;
      reserved[6][i] = true;
    }
    if (!reserved[i][6]) {
      matrix[i][6] = (i % 2 === 0 ? 1 : 0) as 0 | 1;
      reserved[i][6] = true;
    }
  }

  // Alignment patterns (version >= 2)
  if (version >= 2) {
    const positions = ALIGNMENT_POSITIONS[version];
    for (const row of positions) {
      for (const col of positions) {
        if (reserved[row]?.[col]) continue;
        placeAlignment(matrix, reserved, row, col);
      }
    }
  }

  // Dark module
  matrix[modSize - 8][8] = 1;
  reserved[modSize - 8][8] = true;

  // Reserve format info areas
  for (let i = 0; i < 8; i++) {
    reserved[8][i] = true;
    reserved[8][modSize - 1 - i] = true;
    reserved[i][8] = true;
    reserved[modSize - 1 - i][8] = true;
  }
  reserved[8][8] = true;

  // Reserve version info (version >= 7)
  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        reserved[i][modSize - 11 + j] = true;
        reserved[modSize - 11 + j][i] = true;
      }
    }
  }

  // Place data bits
  const dataBits: number[] = [];
  for (const byte of interleaved) pushBits(dataBits, byte, 8);
  // Add remainder bits
  const remainderBits = REMAINDER_BITS[version] || 0;
  for (let i = 0; i < remainderBits; i++) dataBits.push(0);

  let bitIndex = 0;
  for (let right = modSize - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // skip timing column
    for (let vert = 0; vert < modSize; vert++) {
      for (let j = 0; j < 2; j++) {
        const col = right - j;
        const row = ((right + 1) & 2) === 0 ? modSize - 1 - vert : vert;
        if (row < 0 || row >= modSize || col < 0 || col >= modSize) continue;
        if (reserved[row][col]) continue;
        if (bitIndex < dataBits.length) {
          matrix[row][col] = dataBits[bitIndex] as 0 | 1;
          bitIndex++;
        } else {
          matrix[row][col] = 0;
        }
      }
    }
  }

  // Apply mask (mask 0: (row + col) % 2 === 0)
  const mask = 0;
  for (let row = 0; row < modSize; row++) {
    for (let col = 0; col < modSize; col++) {
      if (reserved[row][col]) continue;
      if ((row + col) % 2 === 0) {
        matrix[row][col] = (matrix[row][col]! ^ 1) as 0 | 1;
      }
    }
  }

  // Write format info (mask 0, EC level L = 01)
  // Format: EC(01) + mask(000) = 01000
  // After BCH: 0b111011111000100 = 0x77C4
  const formatBits = 0b111011111000100;
  const formatPositions1 = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  const formatPositions2 = [
    [8, modSize - 1], [8, modSize - 2], [8, modSize - 3], [8, modSize - 4],
    [8, modSize - 5], [8, modSize - 6], [8, modSize - 7], [8, modSize - 8],
    [modSize - 7, 8], [modSize - 6, 8], [modSize - 5, 8], [modSize - 4, 8],
    [modSize - 3, 8], [modSize - 2, 8], [modSize - 1, 8],
  ];
  for (let i = 0; i < 15; i++) {
    const bit = ((formatBits >> (14 - i)) & 1) as 0 | 1;
    const [r1, c1] = formatPositions1[i];
    matrix[r1][c1] = bit;
    const [r2, c2] = formatPositions2[i];
    matrix[r2][c2] = bit;
  }

  // Draw on canvas
  const ctx = canvas.getContext('2d')!;
  const cellSize = size / (modSize + 8); // quiet zone of 4 on each side
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';

  for (let row = 0; row < modSize; row++) {
    for (let col = 0; col < modSize; col++) {
      if (matrix[row][col] === 1) {
        ctx.fillRect(
          Math.round((col + 4) * cellSize),
          Math.round((row + 4) * cellSize),
          Math.ceil(cellSize),
          Math.ceil(cellSize)
        );
      }
    }
  }
}

// ── QR Helpers ────────────────────────────────────────────────────────────────

function encodeUTF8(str: string): number[] {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(str));
}

function pushBits(arr: number[], value: number, count: number) {
  for (let i = count - 1; i >= 0; i--) {
    arr.push((value >> i) & 1);
  }
}

function bitsToBytes(bits: number[]): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8 && i + j < bits.length; j++) {
      byte = (byte << 1) | bits[i + j];
    }
    bytes.push(byte);
  }
  return bytes;
}

function selectVersion(dataLen: number): number {
  // Byte mode, EC level L capacities
  const caps = [0, 17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520, 586];
  for (let v = 1; v < caps.length; v++) {
    const overhead = v <= 9 ? 2 : 3; // mode + char count bytes
    if (dataLen + overhead <= caps[v]) return v;
  }
  return 10; // fallback
}

interface ECInfo {
  totalData: number;
  ecPerBlock: number;
  blocks: { count: number; dataCodewords: number }[];
}

const EC_TABLE: Record<number, ECInfo> = {
  1: { totalData: 19, ecPerBlock: 7, blocks: [{ count: 1, dataCodewords: 19 }] },
  2: { totalData: 34, ecPerBlock: 10, blocks: [{ count: 1, dataCodewords: 34 }] },
  3: { totalData: 55, ecPerBlock: 15, blocks: [{ count: 1, dataCodewords: 55 }] },
  4: { totalData: 80, ecPerBlock: 20, blocks: [{ count: 1, dataCodewords: 80 }] },
  5: { totalData: 108, ecPerBlock: 26, blocks: [{ count: 1, dataCodewords: 108 }] },
  6: { totalData: 136, ecPerBlock: 18, blocks: [{ count: 2, dataCodewords: 68 }] },
  7: { totalData: 156, ecPerBlock: 20, blocks: [{ count: 2, dataCodewords: 78 }] },
  8: { totalData: 194, ecPerBlock: 24, blocks: [{ count: 2, dataCodewords: 97 }] },
  9: { totalData: 232, ecPerBlock: 30, blocks: [{ count: 2, dataCodewords: 116 }] },
  10: { totalData: 274, ecPerBlock: 18, blocks: [{ count: 2, dataCodewords: 68 }, { count: 2, dataCodewords: 69 }] },
};

const ALIGNMENT_POSITIONS: Record<number, number[]> = {
  2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34],
  7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
};

const REMAINDER_BITS: Record<number, number> = {
  1: 0, 2: 7, 3: 7, 4: 7, 5: 7, 6: 7, 7: 0, 8: 0, 9: 0, 10: 0,
};

// Galois Field GF(256) arithmetic for Reed-Solomon
const GF_EXP: number[] = new Array(512);
const GF_LOG: number[] = new Array(256);

(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x >= 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsEncode(data: number[], ecCount: number): number[] {
  // Generate generator polynomial
  let gen = [1];
  for (let i = 0; i < ecCount; i++) {
    const newGen = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      newGen[j] ^= gen[j];
      newGen[j + 1] ^= gfMul(gen[j], GF_EXP[i]);
    }
    gen = newGen;
  }

  const remainder = new Array(ecCount).fill(0);
  for (const byte of data) {
    const factor = byte ^ remainder[0];
    remainder.shift();
    remainder.push(0);
    for (let i = 0; i < ecCount; i++) {
      remainder[i] ^= gfMul(factor, gen[i + 1]);
    }
  }
  return remainder;
}

function placeFinder(
  matrix: (0 | 1 | null)[][],
  reserved: boolean[][],
  row: number,
  col: number
) {
  const pattern = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];
  const size = matrix.length;
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const mr = row + r;
      const mc = col + c;
      if (mr < 0 || mr >= size || mc < 0 || mc >= size) continue;
      if (r >= 0 && r < 7 && c >= 0 && c < 7) {
        matrix[mr][mc] = pattern[r][c] as 0 | 1;
      } else {
        matrix[mr][mc] = 0;
      }
      reserved[mr][mc] = true;
    }
  }
}

function placeAlignment(
  matrix: (0 | 1 | null)[][],
  reserved: boolean[][],
  row: number,
  col: number
) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const mr = row + r;
      const mc = col + c;
      if (mr < 0 || mr >= matrix.length || mc < 0 || mc >= matrix.length) continue;
      if (reserved[mr][mc]) continue;
      const isEdge = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      matrix[mr][mc] = (isEdge || isCenter ? 1 : 0) as 0 | 1;
      reserved[mr][mc] = true;
    }
  }
}

// ── Step Badge Component ──────────────────────────────────────────────────────

function StepBadge({ step }: { step: number }) {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#5B8AEF]/15 text-[#5B8AEF] text-xs font-bold shrink-0">
      {step}
    </span>
  );
}

// ── Copy Button ───────────────────────────────────────────────────────────────

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button onClick={handleCopy} className={btnSecondary}>
      {copied ? (
        <span className="flex items-center gap-1.5">
          <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {label}
        </span>
      )}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReviewLink() {
  const [placeId, setPlaceId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('[Name]');

  const reviewUrl = placeId.trim()
    ? `https://search.google.com/local/writereview?placeid=${placeId.trim()}`
    : '';

  const emailTemplate = `Hi ${contactName},\n\nThank you for choosing ${businessName || '[Business Name]'}. We really appreciate your support!\n\nIf you have a moment, we'd love to hear about your experience. It only takes 30 seconds and helps other customers find us:\n\n${reviewUrl}\n\nThank you,\n${businessName || '[Business Name]'}`;

  const smsTemplate = `Hi ${contactName}! Thanks for choosing ${businessName || '[Business Name]'}. We'd love your feedback - it takes 30 seconds: ${reviewUrl}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Google Review Link Generator
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-2xl mx-auto">
          Generate a direct link that takes customers straight to your Google review form.
          More reviews means better local SEO rankings and more trust from potential customers.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: Steps 1-2 */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Find Place ID */}
          <div className={cardClass}>
            <div className="flex items-center gap-3 mb-5">
              <StepBadge step={1} />
              <h2 className="text-lg font-semibold text-foreground">Find Your Place ID</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Business Name (for templates)</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Costa Coffee Reading"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Google Place ID</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                  value={placeId}
                  onChange={(e) => setPlaceId(e.target.value)}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Your Place ID starts with &quot;ChIJ&quot; and uniquely identifies your business on Google Maps.
                </p>
              </div>

              <div className="rounded-lg border border-[#5B8AEF]/20 bg-[#5B8AEF]/[0.04] p-4">
                <p className="text-sm text-foreground font-medium mb-2">How to find your Place ID:</p>
                <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>
                    Open the{' '}
                    <a
                      href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5B8AEF] hover:underline"
                    >
                      Google Place ID Finder
                    </a>
                  </li>
                  <li>Search for your business name and location</li>
                  <li>Click on your business in the map results</li>
                  <li>Copy the Place ID that appears (starts with &quot;ChIJ...&quot;)</li>
                  <li>Paste it in the field above</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Step 2: Generated Links */}
          {reviewUrl && (
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-5">
                <StepBadge step={2} />
                <h2 className="text-lg font-semibold text-foreground">Your Review Link</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Direct Review Link</label>
                  <div className={urlDisplayClass}>
                    <span className="text-[#5B8AEF]">{reviewUrl}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <CopyButton text={reviewUrl} label="Copy Link" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Short Display Version</label>
                  <div className={urlDisplayClass}>
                    <span className="text-muted-foreground">g.page/review/{placeId.trim().slice(0, 12)}...</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Use the full link above for sharing. This is just for display purposes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Share Options */}
          {reviewUrl && (
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-5">
                <StepBadge step={3} />
                <h2 className="text-lg font-semibold text-foreground">Share Templates</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Customer name (for templates)</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="[Name]"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value || '[Name]')}
                  />
                </div>

                {/* Email Template */}
                <div className={templateCardClass}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-[#5B8AEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-foreground">Email Template</span>
                    </div>
                    <CopyButton text={emailTemplate} label="Copy Email" />
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed font-sans">
                    {emailTemplate}
                  </pre>
                </div>

                {/* SMS Template */}
                <div className={templateCardClass}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-[#5B8AEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-foreground">SMS Template</span>
                    </div>
                    <CopyButton text={smsTemplate} label="Copy SMS" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {smsTemplate}
                  </p>
                </div>

                {/* QR Code */}
                <div className={templateCardClass}>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="h-4 w-4 text-[#5B8AEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span className="text-sm font-medium text-foreground">QR Code</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Print this QR code on receipts, business cards, or table stands so customers can leave a review instantly.
                  </p>
                  <QRCode value={reviewUrl} size={200} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: SEO info + Tips */}
        <div className="space-y-8">
          {/* How it helps SEO */}
          <div className={cardClass}>
            <h3
              className="text-base font-semibold text-foreground mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              How Reviews Help Your SEO
            </h3>
            <ul className="space-y-3">
              {[
                {
                  title: 'Top-3 local ranking factor',
                  desc: 'Google reviews are one of the three most important signals for local pack rankings.',
                },
                {
                  title: 'Star ratings in search results',
                  desc: 'Review stars appear directly in search results, dramatically improving click-through rates.',
                },
                {
                  title: 'Review velocity matters',
                  desc: 'Consistent new reviews signal an active, trusted business to Google\'s algorithm.',
                },
                {
                  title: 'Keyword-rich reviews help rankings',
                  desc: 'When customers mention services or products in reviews, it helps you rank for those terms.',
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <svg className="h-5 w-5 text-[#5B8AEF] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div className={cardClass}>
            <h3
              className="text-base font-semibold text-foreground mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Tips for Getting More Reviews
            </h3>
            <ul className="space-y-3">
              {[
                {
                  title: 'Ask at the right moment',
                  desc: 'The best time to request a review is right after a positive experience, when satisfaction is highest.',
                },
                {
                  title: 'Never incentivise reviews',
                  desc: 'Offering discounts or gifts for reviews violates Google\'s Terms of Service and can get your listing penalised.',
                },
                {
                  title: 'Respond to every review',
                  desc: 'Reply to all reviews, both positive and negative. It shows you care and encourages others to leave feedback.',
                },
                {
                  title: 'Aim for 5+ reviews per month',
                  desc: 'Consistent review velocity is more valuable than a one-time burst. Set a monthly target for local SEO impact.',
                },
                {
                  title: 'Make it effortless',
                  desc: 'Use the direct link from this tool. Every extra click reduces the chance a customer will complete a review.',
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <svg className="h-5 w-5 text-[#5B8AEF]/60 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="rounded-xl border border-[#5B8AEF]/20 bg-[#5B8AEF]/[0.04] p-6 text-center">
            <p className="text-sm font-medium text-foreground mb-2">Need help with local SEO?</p>
            <p className="text-xs text-muted-foreground mb-4">
              I help businesses improve their Google rankings, get more reviews, and attract local customers.
            </p>
            <a href="/contact/" className={btnPrimary}>
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
