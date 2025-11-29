/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  // Disable ESLint during builds in CI to avoid blocking when ESLint
  // rules or plugins are not available in the environment. This only
  // affects build-time linting; keep linting in local dev if desired.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Export static HTML output (replaces the old `next export` CLI).
  // This sets Next's output mode to static export. Ensure your app
  // doesn't rely on runtime-only server features if you enable this.
  output: "export",
  // Keep default basePath/assetPrefix for Vercel deployments so static
  // assets are served from the site root. If you deploy to a subpath
  // (e.g. GitHub Pages), reintroduce `basePath` and `assetPrefix`.
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
