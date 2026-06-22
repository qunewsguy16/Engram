# Deploy to Synology DS423+ (Container Manager)

Self-hosted, always-on, reachable from any device on your Tailscale tailnet at
**`http://mousedrops:3000`** (Magic DNS).

## Prerequisites

- DS423+ with **Container Manager** installed (Package Center → Container Manager).
- **SSH enabled** on the NAS (Control Panel → Terminal & SNMP → "Enable SSH service").
- **Tailscale** installed on the NAS (Package Center → Tailscale) and signed in to the same tailnet as your other devices. Magic DNS makes `mousedrops` resolve from any tailnet device.

## One-time setup

SSH into the NAS as a user in the `administrators` group (works from any device — Termius on iPhone, PowerShell on PC, anything):

```sh
ssh <you>@mousedrops
```

Pick a project directory. Synology's convention is `/volume1/docker/`:

```sh
sudo mkdir -p /volume1/docker/engram-os
sudo chown $(id -u):$(id -g) /volume1/docker/engram-os
cd /volume1/docker/engram-os

# Clone the repo and check out the branch
git clone https://github.com/qunewsguy16/Engram.git .
git checkout claude/custom-code-os-dashboard-BOlVQ
cd claude-os-dashboard
```

Optional — set secrets/flags by copying the example env and editing:

```sh
cp .env.example .env
nano .env
# Fill in ANTHROPIC_API_KEY, GITHUB_TOKEN, etc. and set
#   FEATURE_DREAM_LIVE=true
#   FEATURE_REAL_CONNECTORS=true
# for any integrations you want active.
```

Build and start:

```sh
sudo docker compose up -d --build
```

First build takes 2–4 minutes (compiles `better-sqlite3` once, then caches). Subsequent rebuilds are seconds.

## Verify

```sh
sudo docker compose ps                # should show 'engram-os' with status 'Up (healthy)'
sudo docker compose logs -f dashboard # tail the logs; Ctrl-C to exit
curl -sI http://localhost:3000/       # 200 OK from the NAS itself
```

From your iPhone (on tailnet) open: **`http://mousedrops:3000`** and bookmark it to the home screen.

## Updating

When new commits land on the branch:

```sh
cd /volume1/docker/engram-os
git pull
cd claude-os-dashboard
sudo docker compose up -d --build
```

The `engram-data` named volume preserves your SQLite DB across rebuilds — captures, reviews, learning, and dream history all persist.

## Container Manager UI (alternative to SSH)

If you'd rather use the Synology web UI:

1. **File Station** → upload the `claude-os-dashboard` directory to `/volume1/docker/engram-os/`.
2. **Container Manager** → **Project** → **Create**.
3. Project name: `engram-os`. Path: `/volume1/docker/engram-os/claude-os-dashboard`. Source: "Use existing docker-compose.yml".
4. Optional: paste env vars in the "Environment" step.
5. Build & start.

## Troubleshooting

- **Port 3000 already taken** — change `"3000:3000"` in `docker-compose.yml` to `"3030:3000"` (or any free host port). Tailscale URL becomes `http://mousedrops:3030`.
- **DB looks empty after a redeploy** — confirm the volume mounted: `sudo docker volume inspect engram-data`. If the `Mountpoint` directory has the `.sqlite` files, the data is there.
- **Live `/dream` returns mocks despite the flag** — `docker compose logs` will print a warning if the Anthropic key is missing or invalid. Confirm `.env` was loaded: `sudo docker compose config` shows the resolved values.
- **Magic DNS doesn't resolve `mousedrops`** — fall back to the raw tailnet IP (e.g. `http://100.86.244.9:3000`); enable Magic DNS in the Tailscale admin console to fix.
