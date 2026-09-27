// Every OG image is prerendered and served from the static-assets cache, so the Worker never
// renders one. Stubbing the renderer keeps the bundle under the Workers free-plan 3 MB limit.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(path.join(root, ".next/prerender-manifest.json"), "utf8"));
const routes = JSON.parse(readFileSync(path.join(root, ".next/app-path-routes-manifest.json"), "utf8"));

const isOg = (route) => /\/(opengraph|twitter)-image$/.test(route) || route.startsWith("/og/");
const dynamic = manifest.dynamicRoutes;
const unsafe = Object.values(routes)
  .filter(isOg)
  .filter((route) => route.includes("[") ? dynamic[route]?.fallback !== false : !manifest.routes[route]);

if (unsafe.length) {
  console.error(`cf-strip-og: these OG routes can render at runtime, refusing to stub:\n  ${unsafe.join("\n  ")}`);
  process.exit(1);
}

const ogDir = path.join(root, ".open-next/server-functions/default/node_modules/next/dist/compiled/@vercel/og");
const emptyWasm = Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
for (const [file, stub] of [["resvg.wasm", emptyWasm], ["yoga.wasm", emptyWasm], ["Geist-Regular.ttf.bin", Buffer.alloc(0)]]) {
  const target = path.join(ogDir, file);
  if (!existsSync(target)) throw new Error(`cf-strip-og: ${target} not found, OpenNext layout changed`);
  writeFileSync(target, stub);
}
console.log(`cf-strip-og: ${Object.keys(manifest.routes).filter(isOg).length} OG images prerendered, renderer stubbed`);
