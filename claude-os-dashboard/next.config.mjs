import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // better-sqlite3 ships a native .node binary; never bundle it.
  serverExternalPackages: ["better-sqlite3"],
  // Standalone output ships only the files needed at runtime — keeps the
  // Docker image small (~150 MB vs ~1 GB with node_modules + sources).
  output: "standalone",
  // Pin the trace root to THIS directory; otherwise Next walks up to the
  // parent Engram/ repo and nests the standalone output under
  // claude-os-dashboard/, which breaks the Dockerfile's COPY paths.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
