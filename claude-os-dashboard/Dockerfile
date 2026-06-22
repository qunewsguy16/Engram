# syntax=docker/dockerfile:1.7

# Multi-stage build for the Claude Code OS Dashboard.
#
# Targets a Synology DS423+ (Intel Celeron J4125 = linux/amd64), but works
# anywhere Docker runs. The runtime stage is ~150 MB: standalone Next output +
# better-sqlite3's compiled .node, no source, no dev deps, no build toolchain.

ARG NODE_VERSION=22-bookworm-slim

# ── deps ──────────────────────────────────────────────────────────────────────
# Compile better-sqlite3 (and any future native deps) here so the runtime stage
# doesn't need a build toolchain.
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN apt-get update \
 && apt-get install --no-install-recommends -y python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ── build ─────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── runtime ───────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/data/engram-os.sqlite

# Non-root user (UID 1024 matches Synology's default for shared-folder access;
# harmless elsewhere).
RUN groupadd --system --gid 1024 app \
 && useradd  --system --uid 1024 --gid app --shell /usr/sbin/nologin app

# Standalone output. .next/standalone has server.js + the minimal node_modules
# slice Next needs; .next/static and public are copied alongside, the paths
# Next expects to find them at.
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static     ./.next/static
COPY --from=build --chown=app:app /app/public           ./public

# better-sqlite3 lives outside the standalone trace (we set serverExternalPackages),
# so copy its compiled binary in by hand.
COPY --from=build --chown=app:app /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=build --chown=app:app /app/node_modules/bindings        ./node_modules/bindings
COPY --from=build --chown=app:app /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

# DB lives on a mounted volume so it persists across container rebuilds.
RUN mkdir -p /data && chown -R app:app /data
VOLUME ["/data"]

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
