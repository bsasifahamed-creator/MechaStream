import { NextRequest, NextResponse } from "next/server";

const FLASK_API_URL = process.env.FLASK_API_URL || "http://localhost:5000";

/**
 * Proxy to Flask backend schema-first generate pipeline.
 * POST body: { prompt: string }
 * Returns: { success, schema?, pages?, warning?, errors? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json(
        { success: false, errors: ["Missing or empty prompt"], message: "Please provide a prompt." },
        { status: 400 }
      );
    }

    const res = await fetch(`${FLASK_API_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(200000),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          errors: data.errors || [data.message || `Flask returned ${res.status}`],
          message: data.message || "Generation failed.",
        },
        { status: res.status >= 500 ? 503 : res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isTimeout = message.includes("abort") || message.includes("timeout");
    return NextResponse.json(
      {
        success: false,
        errors: [isTimeout ? "Request timed out. Try a shorter prompt." : "Failed to connect to Studio API. Is Flask running on port 5000?"],
        message: "Studio API unavailable.",
      },
      { status: 503 }
    );
  }
}
