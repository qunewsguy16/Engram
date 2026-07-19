# Deploy to Synology DS423+ (Container Manager)

Self-hosted, always-on, reachable from any device on your Tailscale tailnet at
**`http://mousedrops:3000`** (Magic DNS).

## Prerequisites

- DS423+ with **Container Manager** installed (Package Center → Container Manager).
- **SSH enabled** on the NAS (Control Panel → Terminal & SNMP → "Enable SSH service").
- **Tailscale** installed on the NAS (Package Center → Tailscale) and signed in to the same tailnet as your other devices. Magic DNS makes `mousedrops` resolve from any tailnet device.
- **git on the NAS** — DSM does not ship git by default. Install **Git Server**
  from Package Center (the package includes the `git` CLI; you don't need to
  enable the server part), or skip git entirely: download the branch as a ZIP
  from GitHub, upload via File Station, and build from that directory.

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

## Connecting Todoist (real projects + tasks)

Turns the **Projects** widget into your Todoist project list, and feeds the
**Up next** priority list with your real tasks (due today / overdue, by
priority). Your tasks are fetched live on the NAS and never committed anywhere.

1. Get a Todoist API token: Todoist → **Settings → Integrations → Developer →
   Copy API token** (a long hex string, *not* an OAuth token).
2. In `~/engram-os/claude-os-dashboard` on the NAS, add it to `.env` (one line
   at a time; the token has no expiry):
   ```sh
   echo 'TODOIST_TOKEN=your-token-here' >> .env
   echo 'FEATURE_REAL_CONNECTORS=true' >> .env
   ```
3. Apply it:
   ```sh
   sudo docker compose up -d --force-recreate
   ```

The Projects widget header will read **"N from Todoist"** with a green live
dot, and the Up-next priorities will show your real tasks. If the token is
missing or wrong, both widgets silently fall back to the mock data — no errors.

> Only your **active, non-inbox** Todoist projects that have tasks show as
> cards, sorted by task count. Inbox tasks still appear in the priority list if
> they're due/overdue.

## Container Manager UI (alternative to SSH)

If you'd rather use the Synology web UI:

1. **File Station** → upload the `claude-os-dashboard` directory to `/volume1/docker/engram-os/`.
2. **Container Manager** → **Project** → **Create**.
3. Project name: `engram-os`. Path: `/volume1/docker/engram-os/claude-os-dashboard`. Source: "Use existing docker-compose.yml".
4. Optional: paste env vars in the "Environment" step.
5. Build & start.

## Security note (read once)

The app has **no authentication** — by design, for a personal tailnet tool.
The default compose config publishes port 3000 on **every** NAS interface,
which includes your LAN. If anything untrusted shares your LAN (guests, IoT),
either:

- Bind to the Tailscale interface only — in `docker-compose.yml`, change the
  port mapping to `"100.86.244.9:3000:3000"` (your NAS's tailnet IP). Then the
  dashboard is reachable exclusively through Tailscale.
- Or add a DSM firewall rule allowing TCP 3000 from the Tailscale subnet
  (100.64.0.0/10) only.

With `FEATURE_DREAM_LIVE=true`, reaching the dashboard also means being able
to trigger Claude API calls on your key (capped by `DREAM_DAILY_BUDGET_USD`,
default $1/day) — one more reason to keep it tailnet-only.

## Troubleshooting

- **`docker compose` not recognized** — older Container Manager builds ship
  the standalone binary instead of the plugin; use `sudo docker-compose up -d --build`
  (hyphenated). Same flags, same behavior.
- **Port 3000 already taken** — change `"3000:3000"` in `docker-compose.yml` to `"3030:3000"` (or any free host port). Tailscale URL becomes `http://mousedrops:3030`.
- **DB looks empty after a redeploy** — confirm the volume mounted: `sudo docker volume inspect engram-data`. If the `Mountpoint` directory has the `.sqlite` files, the data is there.
- **Live `/dream` returns mocks despite the flag** — `docker compose logs` will print a warning if the Anthropic key is missing or invalid. Confirm `.env` was loaded: `sudo docker compose config` shows the resolved values.
- **Magic DNS doesn't resolve `mousedrops`** — fall back to the raw tailnet IP (e.g. `http://100.86.244.9:3000`); enable Magic DNS in the Tailscale admin console to fix.
