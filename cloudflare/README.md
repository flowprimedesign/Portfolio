# Cloudflare Worker: Gemini proxy

This folder contains an example Cloudflare Worker (`worker.js`) you can deploy to host the Gemini proxy for your static site. The Worker forwards POST requests to the Gemini generateContent endpoint and keeps your `GOOGLE_API_KEY` secret.

Security notes

- Do NOT commit your `GOOGLE_API_KEY` anywhere in the repo.
- Store `GOOGLE_API_KEY` and optional `PROXY_KEY` as Worker secrets via Wrangler or the Cloudflare dashboard.

Quick deploy with Wrangler

1. Install Wrangler (if not installed):

```bash
npm install -g wrangler
```

2. Authenticate:

```bash
wrangler login
```

3. Create a Worker project (or use this file in an existing project). Then set secrets:

```bash
# Set the Google API key (secret)
wrangler secret put GOOGLE_API_KEY

# (Optional) Set a small shared key to protect the endpoint from public abuse
wrangler secret put PROXY_KEY
```

4. Publish the Worker:

```bash
wrangler publish ./cloudflare/worker.js --name your-worker-name
```

5. Configure a custom route or use the Worker subdomain. Copy the published worker URL and set the static site to call it.

Client usage

- In your static site, set `NEXT_PUBLIC_API_BASE` to your Worker URL (e.g. `https://your-worker.example.workers.dev`) so the client posts to `https://.../geminichat` and `https://.../geminiproxy`.

Notes and alternatives

- Cloudflare Workers are lightweight and low-latency for proxying requests. They are a great fit if your proxy only forwards requests and returns responses.
- If you need more complex server logic or long-running processes, consider Google Cloud Run, Render, or Vercel Serverless Functions.
