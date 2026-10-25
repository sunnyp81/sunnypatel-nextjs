// Minimal in-browser ZIP reader for Search Console exports: stored and deflate entries only, with size guards.
export type ZipEntry = { name: string; text: string };

const MAX_ENTRIES = 60;
const MAX_ENTRY_BYTES = 60_000_000;
const MAX_TOTAL_BYTES = 150_000_000;

export const MAX_ZIP_BYTES = 40_000_000;

export function canInflate(): boolean {
  if (typeof DecompressionStream === "undefined") return false;
  try {
    new DecompressionStream("deflate-raw");
    return true;
  } catch {
    return false;
  }
}

async function inflateRaw(data: Uint8Array, limit: number): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel();
      throw new Error("A file inside the zip is larger than this tool accepts.");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
}

export async function readZip(file: Blob): Promise<ZipEntry[]> {
  if (file.size > MAX_ZIP_BYTES) throw new Error("This zip file is larger than this tool accepts.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) {
    if (view.getUint32(i, true) === 0x06054b50 && i + 22 + view.getUint16(i + 20, true) === bytes.length) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("This does not look like a zip file.");
  const count = view.getUint16(eocd + 10, true);
  const dirOffset = view.getUint32(eocd + 16, true);
  if (count === 0xffff || dirOffset === 0xffffffff)
    throw new Error("This zip uses the zip64 format, which this tool cannot read. Unzip it and upload the CSV files instead.");
  if (count > MAX_ENTRIES) throw new Error("The zip holds more files than a Search Console export should.");
  const decoder = new TextDecoder("utf-8");
  const out: ZipEntry[] = [];
  let total = 0;
  let pos = dirOffset;
  for (let n = 0; n < count; n++) {
    if (pos + 46 > bytes.length || view.getUint32(pos, true) !== 0x02014b50)
      throw new Error("The zip directory is damaged.");
    const flags = view.getUint16(pos + 8, true);
    const method = view.getUint16(pos + 10, true);
    const csize = view.getUint32(pos + 20, true);
    const usize = view.getUint32(pos + 24, true);
    const nameLen = view.getUint16(pos + 28, true);
    const extraLen = view.getUint16(pos + 30, true);
    const commentLen = view.getUint16(pos + 32, true);
    const local = view.getUint32(pos + 42, true);
    const name = decoder.decode(bytes.subarray(pos + 46, pos + 46 + nameLen));
    pos += 46 + nameLen + extraLen + commentLen;
    if (name.endsWith("/") || /(^|\/)__MACOSX\//.test(name)) continue;
    if (flags & 1) throw new Error("The zip is password protected.");
    if (usize > MAX_ENTRY_BYTES || csize > MAX_ENTRY_BYTES) throw new Error("A file inside the zip is larger than this tool accepts.");
    if (local + 30 > bytes.length || view.getUint32(local, true) !== 0x04034b50)
      throw new Error("The zip directory is damaged.");
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    if (start + csize > bytes.length) throw new Error("The zip directory is damaged.");
    const raw = bytes.subarray(start, start + csize);
    let data: Uint8Array;
    if (method === 0) {
      if (csize !== usize) throw new Error("The zip directory is damaged.");
      data = raw;
    } else if (method === 8) {
      if (!canInflate())
        throw new Error("This browser cannot unpack zip files. Use a current Chrome, Edge, Safari or Firefox, or unzip the file and upload the CSVs.");
      data = await inflateRaw(raw, Math.min(MAX_ENTRY_BYTES, MAX_TOTAL_BYTES - total));
      if (data.length !== usize) throw new Error("The zip directory is damaged.");
    } else throw new Error("The zip uses a compression method this tool cannot read.");
    total += data.length;
    if (total > MAX_TOTAL_BYTES) throw new Error("The zip expands to more data than this tool accepts.");
    out.push({ name, text: decoder.decode(data) });
  }
  return out;
}
