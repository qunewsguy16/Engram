# Working notes for Claude

## SSH / PowerShell instructions (user preference — always apply)
When giving the user SSH commands for PowerShell, ALWAYS assume a brand-new
PowerShell window: start from scratch — including the `ssh` connect command
itself — and give each command on its OWN line to copy-paste one at a time.
Never batch multiple commands into one block (multi-line paste gets mangled in
the user's terminal). Exception: when we're already actively mid-session
(connected and working on the NAS), continue from the current state.

## Synology DS423+ ("MouseDrops") deploy facts
- Connect over the LAN, NOT the tailnet name: `ssh qunewsguy@192.168.50.213`
  (NordVPN's kill-switch breaks the Tailscale route to 100.86.244.9 from the PC).
- User `qunewsguy` is a DSM administrator; SSH uses password auth (passwordless
  keys/NOPASSWD sudo not yet set up — the synology-ds423-selfhost skill covers it).
- Dashboard lives at ~/engram-os/claude-os-dashboard on the NAS.
- Deploy / update (one command per line):
  git pull
  sudo docker compose up -d --build
- Config/secrets in .env there (git- and docker-ignored). Data persists in the
  `engram-data` Docker volume across rebuilds.
- iPhone access: http://100.86.244.9:3000 (Tailscale on, NordVPN off/split).
