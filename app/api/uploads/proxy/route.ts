import { NextResponse } from "next/server";

// Proxy R2 asset requests through the dev server to avoid CORS issues.
// Usage: /api/uploads/proxy?url=<publicUrl>
export async function GET(req: Request) {
  try {
    const url = new URL(req.url).searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "missing url" }, { status: 400 });
    }

    const allowedHost = process.env.R2_ENDPOINT || process.env.R2_PUBLIC_URL;
    if (allowedHost) {
      const host = allowedHost.replace(/\/+$|https?:\/\//g, "");
      if (!url.includes(host) && !url.includes(allowedHost)) {
        return NextResponse.json({ error: "url not allowed" }, { status: 403 });
      }
    }

    const fetched = await fetch(url);
    if (!fetched.ok) {
      return NextResponse.json(
        { error: "upstream fetch failed", status: fetched.status },
        { status: fetched.status }
      );
    }

    // Forward content-type and return CORS-friendly response
    const headers: Record<string, string> = {};
    const contentType = fetched.headers.get("content-type");
    if (contentType) headers["content-type"] = contentType;
    headers["access-control-allow-origin"] = "*";

    const body = fetched.body;
    return new NextResponse(body, { headers });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
