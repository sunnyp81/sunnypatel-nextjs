import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const revision = process.env.VERCEL_GIT_COMMIT_SHA;
  if (!revision || !/^[a-f0-9]{40}$/.test(revision)) {
    return NextResponse.json({ error: "Node diagnostic revision unavailable." }, { status: 503 });
  }
  return NextResponse.json({ revision, runtime: "nodejs" }, { headers: { "Cache-Control": "no-store" } });
}
