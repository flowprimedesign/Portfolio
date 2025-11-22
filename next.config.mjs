/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  basePath: isProd ? "/space-portfolio" : undefined,
  assetPrefix: isProd ? "/space-portfolio" : undefined,
  output: "export", // <=== enables static exports
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
