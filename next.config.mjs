/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  basePath: isProd ? "/space-portfolio" : undefined,
  assetPrefix: isProd ? "/space-portfolio" : undefined,
  // Do not use `output: "export"` for Vercel deployments — leave default
  // output so Next.js builds and serves CSS and dynamic features correctly.
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
