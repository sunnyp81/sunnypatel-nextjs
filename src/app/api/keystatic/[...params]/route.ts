import { makeGenericAPIRouteHandler } from "@keystatic/core/api/generic";
import keystaticConfig from "../../../../../keystatic.config";
import path from "path";

export const dynamic = "force-dynamic";

const localBaseDirectory = path.resolve(process.cwd());

const handler = makeGenericAPIRouteHandler(
  { config: keystaticConfig },
  { localBaseDirectory }
);

async function wrappedHandler(request: Request) {
  const url = new URL(request.url);
  if (url.hostname === "localhost") {
    url.hostname = "127.0.0.1";
    request = new Request(url.toString(), request);
  }
  const { body, headers, status } = await handler(request);
  return new Response(body, { status, headers });
}

export const GET = wrappedHandler;
export const POST = wrappedHandler;
