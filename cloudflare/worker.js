// Cloudflare Worker proxy for Gemini (example)
// - Protects `GOOGLE_API_KEY` as a Worker secret binding named `GOOGLE_API_KEY`
// - Accepts POST requests from the static site and forwards them to Gemini
// - Handles CORS preflight (OPTIONS)
// NOTE: Do NOT hardcode secrets. Use `wrangler secret` or the Cloudflare dashboard.

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Safely read secret bindings. Access via `globalThis` or `typeof` so the
// script doesn't throw a ReferenceError if a secret isn't configured.
const GOOGLE_API_KEY_BINDING =
  typeof globalThis.GOOGLE_API_KEY !== "undefined"
    ? globalThis.GOOGLE_API_KEY
    : null;
const PROXY_KEY_BINDING =
  typeof globalThis.PROXY_KEY !== "undefined" ? globalThis.PROXY_KEY : null;

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(request),
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders(request), "Content-Type": "application/json" },
    });
  }

  // Basic auth: expect a header 'x-proxy-key' matching the worker secret
  // (optional) You can enforce this to prevent public misuse.
  const proxyKey = request.headers.get("x-proxy-key");
  if (!PROXY_KEY_BINDING && !proxyKey) {
    // No PROXY_KEY configured; allow by default (not recommended).
  } else if (PROXY_KEY_BINDING && proxyKey !== PROXY_KEY_BINDING) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders(request), "Content-Type": "application/json" },
    });
  }

  // Forward the request body to Gemini with the X-goog-api-key header
  const body = await request.text();

  const resp = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Use the binding if present. If not set, the header will be omitted
      // which will cause the Gemini API to reject the request (expected).
      ...(GOOGLE_API_KEY_BINDING
        ? { "X-goog-api-key": GOOGLE_API_KEY_BINDING }
        : {}),
    },
    body,
  });

  const text = await resp.text();

  return new Response(text, {
    status: resp.status,
    headers: { ...corsHeaders(request), "Content-Type": "application/json" },
  });
}

function corsHeaders(request) {
  const origin = request.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,x-proxy-key",
    "Access-Control-Max-Age": "86400",
  };
}

// Bindings (set these in Wrangler or Cloudflare dashboard):
// - `GOOGLE_API_KEY` (secret) : Google API key for Gemini
// - `PROXY_KEY` (optional secret) : simple shared key to protect the endpoint
