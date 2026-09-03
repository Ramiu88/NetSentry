# Architecture

## Data flow

```
Scheduler (node-cron) ──┐
                         ├──▶ scanService.runScan()
Manual "Run scan now" ───┘         │
                                    ▼
                    nmapService.discoverHosts(cidr)   -- nmap -sn (ARP/ping discovery)
                                    │
                          list of {ip, mac, vendor, hostname}
                                    ▼
                    nmapService.enrichHosts(ips)       -- nmap -sV --top-ports 100 (batched)
                                    │
                          open ports per ip
                                    ▼
                    for each host with a MAC:
                      - deviceModel.upsertDevice()      (keyed by MAC; detects new vs. recurring)
                      - deviceModel.insertSighting()     (one row per device per scan — the history)
                    deviceModel.markInactiveExcept()     (devices not seen this scan → is_active=false)
                                    │
                    anomalyService.detectAnomalies()     (new devices → alertModel.createAlert)
                                    ▼
                              PostgreSQL
                                    ▲
                                    │  REST API (JWT-protected)
                                    ▼
                          React dashboard (polling)
```

All of the above (except the scheduler trigger) runs inside a single Postgres transaction per
scan, so a scan either fully lands or fully rolls back.

## Why devices are keyed by MAC, not IP

IP addresses on a DHCP network change over time; MAC addresses (the network hardware's
built-in identifier) don't. Keying `devices` on `mac_address` is what lets NetSentry
correctly recognize "this is the same laptop as yesterday, just with a new IP" instead of
treating every IP change as a new device. See the network background below for how MAC
addresses are actually discovered.

## How MAC address discovery works (and why it needs elevated privileges)

On a local network, devices don't talk to each other by IP at the hardware level — they use
ARP (Address Resolution Protocol): a broadcast "who has IP X? tell me your MAC" that every
device on the segment can hear, and whoever owns that IP replies with their MAC address.
`nmap -sn <cidr>` automates exactly this broadcast-and-listen exchange across an entire
address range.

Sending/reading raw ARP frames bypasses the normal, sandboxed socket API regular programs
use, so the OS restricts it to processes with elevated network privileges:

- **macOS (local dev)**: the backend process runs as a normal user, so nmap itself is
  invoked via `sudo` when `NMAP_USE_SUDO=true` (see `src/services/nmapService.js`). This
  is scoped to just the nmap binary via a dedicated `/etc/sudoers.d/netsentry-nmap` rule
  (`NOPASSWD` for that one binary only) — not general sudo access.
- **Docker on Linux**: the backend container is granted the `NET_ADMIN` and `NET_RAW`
  Linux capabilities directly (`docker-compose.yml`) instead of running as a privileged
  container or needing sudo at all.

## Documented decisions & known gaps

- **OS detection (`nmap -O`) is out of scope.** It requires raw-socket access similar to
  ARP discovery, and reliably automating it on a schedule would mean either running as
  root everywhere or a more complex capability setup for marginal benefit. `device_type`
  is left null for now; a future iteration could infer a rough guess from vendor + open
  ports instead.
- **Alerts fire once, on first-seen.** A device only ever gets one `unknown_device` alert,
  the first time its MAC is ever recorded. Re-appearing later doesn't re-alert. An admin
  allowlists a device via `PATCH /api/devices/:id { is_known: true }`.
- **MAC vendor lookup is fully offline** (the `oui-data` npm package, a bundled snapshot of
  the IEEE OUI registry) — no live API call, so internal network telemetry never leaves the
  machine. This means the vendor database can drift out of date over time (mitigated by
  periodically updating the dependency), and modern phones that randomize their MAC address
  for privacy will resolve to no vendor at all — this was observed directly during
  development (real scan against the developer's home WiFi).
- **`docker-compose.yml` assumes a Linux Docker host.** `network_mode: host` on the backend
  is what lets nmap see the real LAN instead of Docker's isolated bridge network, but this
  only behaves as expected on Linux — on Docker Desktop for macOS/Windows, "host" networking
  refers to the hidden VM Docker runs in, not the physical LAN. A hotel IT deployment on a
  Linux server (the realistic target) is unaffected by this.
- **Docker was not available in the environment this project was initially built/verified
  in.** The Dockerfiles and `docker-compose.yml` are written and reviewed carefully
  (including working through the host-networking implications above) but were not run
  end-to-end. Verify with `docker compose up` once Docker is installed, in particular that
  the backend container can still see real LAN devices from inside its container.
- **Auth is intentionally minimal**: a single admin account seeded from environment
  variables, JWT stored in `localStorage` on the frontend. This is a documented, deliberate
  simplification appropriate for a small internal tool built in a 2-month internship — not
  an oversight. A production rollout beyond this scope would want httpOnly cookies and
  more than one admin account.
- **No live network access during the jury presentation.** Real Nmap scanning against a real
  LAN (the developer's own devices) is the actual, working mechanism — verified during
  development — but a live scan isn't possible in the presentation room. The plan is to
  record a short video of a real scan, optionally backed by `scripts/seedDemoHistory.js`
  (backfills synthetic *past* scan history for the same *real* discovered devices, so the
  dashboard's history views aren't empty on a single fresh scan). No fake "simulate scan"
  mode exists — everything shown is real functionality.
