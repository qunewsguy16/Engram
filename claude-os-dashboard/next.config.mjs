/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // better-sqlite3 ships a native .node binary; never bundle it.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
