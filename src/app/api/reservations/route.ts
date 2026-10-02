import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("Idempotency-Key");

  try {
    const response = await fetch(
      new URL(
        "/api/reservations",
        process.env.API_BASE_URL ?? "http://localhost:8080",
      ),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        },
        body: await request.text(),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Reservation service unavailable" },
      { status: 502 },
    );
  }
}
