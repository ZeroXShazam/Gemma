import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, string> = {};

  // Check env vars are present (without leaking values)
  results.DATABASE_URL = process.env.DATABASE_URL ? "set" : "missing";
  results.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ? "set" : "missing";
  results.BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? "missing";
  results.BETTER_AUTH_API_KEY = process.env.BETTER_AUTH_API_KEY ? "set" : "missing";

  // Test DB connection
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 1, connectionTimeoutMillis: 5000 });
    await pool.query("SELECT 1");
    await pool.end();
    results.db = "connected";
  } catch (e) {
    results.db = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test auth init
  try {
    const { auth } = await import("@/lib/auth");
    results.auth = auth ? "initialized" : "null";
  } catch (e) {
    results.auth = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(results);
}
