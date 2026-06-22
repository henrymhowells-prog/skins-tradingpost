import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.csfloat.com");

    const text = await response.text();

    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      response: text.substring(0, 500),
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err?.message || "Unknown error",
    });
  }
}