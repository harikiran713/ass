/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude API routes from static generation
  experimental: {
    // This ensures API routes are not statically generated
  },
}

module.exports = nextConfig

