import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

const handler = toNextJsHandler(auth);

export async function GET(req: NextRequest, ctx: { params: Promise<{ all?: string[] }> }) {
  try {
    return await handler.GET(req, ctx);
  } catch (e) {
    const msg = e instanceof Error ? e.message + "\n" + e.stack : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ all?: string[] }> }) {
  try {
    return await handler.POST(req, ctx);
  } catch (e) {
    const msg = e instanceof Error ? e.message + "\n" + e.stack : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
