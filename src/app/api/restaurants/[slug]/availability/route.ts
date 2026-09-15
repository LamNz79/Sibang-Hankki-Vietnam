import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const search = new URL(request.url).searchParams;
  const upstream = new URL(
    `/api/restaurants/${encodeURIComponent(slug)}/availability`,
    process.env.API_BASE_URL ?? "http://localhost:8080",
  );
  for (const key of ["date", "partySize"]) {
    const value = search.get(key);
    if (value !== null) upstream.searchParams.set(key, value);
  }
  try {
    const response = await fetch(upstream, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Availability service unavailable" }, { status: 502 });
  }
}
