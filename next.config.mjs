/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  // Keep default basePath/assetPrefix for Vercel deployments so static
  // assets are served from the site root. If you deploy to a subpath
  // (e.g. GitHub Pages), reintroduce `basePath` and `assetPrefix`.
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
