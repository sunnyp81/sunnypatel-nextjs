// @ts-ignore .open-next/worker.js is generated at build time
import { default as handler } from "./.open-next/worker.js";

// Redirects that used to live in vercel.json and src/proxy.ts (Node middleware is not supported by OpenNext).
export default {
  fetch(request: Request, env: { ASSETS: Fetcher }, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.hostname === "www.sunnypatel.co.uk") {
      url.hostname = "sunnypatel.co.uk";
      return Response.redirect(url.toString(), 308);
    }
    if (url.pathname === "/Services" || url.pathname === "/Services/") {
      url.pathname = "/services/";
      return Response.redirect(url.toString(), 308);
    }
    // next.config rewrite to a public file is not served by OpenNext.
    if (url.pathname === "/cv" || url.pathname === "/cv/") {
      url.pathname = "/cv.pdf";
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }
    return handler.fetch(request, env, ctx);
  },
} satisfies ExportedHandler;
