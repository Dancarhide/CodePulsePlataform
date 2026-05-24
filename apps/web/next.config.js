/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@codepulse/shared-dtos", "@codepulse/database"],
};

module.exports = nextConfig;
