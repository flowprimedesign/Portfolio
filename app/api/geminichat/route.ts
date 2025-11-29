// Minimal server proxy to Gemini 2.0 Flash. Uses X-goog-api-key header.
import { NextResponse } from "next/server";

type Body = {
  systemPrompt?: string;
  messages: { role: string; text: string }[];
};

export async function POST(req: Request) {
  const body: Body = await req.json().catch(() => ({ messages: [] }));
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Missing GOOGLE_API_KEY on server" },
      { status: 500 }
    );
  }

  // Build a single prompt: system + recent messages
  const system = body.systemPrompt ? `${body.systemPrompt}\n\n` : "";
  const conversation = (body.messages || [])
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n\n");
  const promptText = `${system}${conversation}\n\nAssistant:`;

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  try {
    // Use the same request shape as the other proxy (no top-level "temperature" field).
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": key,
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
    });

    const txt = await resp.text().catch(() => "");
    let data: any = null;
    try {
      data = JSON.parse(txt);
    } catch (e) {
      data = txt;
    }

    // Extract model text with a few fallbacks
    let reply: string = "";
    try {
      reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        data?.candidates?.[0]?.content?.text ??
        data?.candidates?.[0]?.output ??
        (typeof data === "string" ? data : "") ??
        "";
    } catch (e) {
      reply = typeof data === "string" ? data : "";
    }

    const debug = {
      modelVersion: data?.modelVersion ?? null,
      responseId: data?.responseId ?? null,
      rawSnippet: JSON.stringify(data)?.slice(0, 2000) ?? null,
      status: resp.status,
    };

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Gemini proxy ${resp.status}`, debug },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply, debug });
  } catch (err) {
    return NextResponse.json(
      { error: "Gemini proxy error", details: String(err) },
      { status: 500 }
    );
  }
}
