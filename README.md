# NetSentry

A network device discovery & mapping tool built for the IT department of the Mövenpick
Hôtel Tanger (2-month internship project — see `docs/Cahier_des_Charges_Projet.docx`).

NetSentry periodically scans the hotel's local network with Nmap, keeps a history of every
device it has ever seen (IP, MAC address, vendor, open ports), and flags/alerts on any device
seen for the first time, so IT staff always know what's actually connected.

- **Backend**: Node.js / Express, PostgreSQL, Nmap (spawned as a child process, XML output parsed)
- **Frontend**: React + Vite dashboard (device list, device history, alerts, scan history)
- **Deployment**: Docker Compose (backend + frontend + Postgres)

See `docs/ARCHITECTURE.md` for how it all fits together, the scan lifecycle, and documented
decisions/gaps.

## Local development (no Docker)

Prerequisites: Node 20+, PostgreSQL, Nmap.

```bash
# 1. Database
brew install postgresql@16 nmap   # macOS; use your distro's package manager on Linux
brew services start postgresql@16
createdb netsentry_dev

# 2. Backend
cd backend
cp .env.example .env              # fill in DATABASE_URL / JWT_SECRET / ADMIN_* / SCAN_TARGET_CIDR
npm install
npm run migrate
npm run dev                        # http://localhost:4000

# 3. Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                        # http://localhost:5173
```

On first boot, the backend seeds a single admin user from `ADMIN_USERNAME`/`ADMIN_PASSWORD`.
Log in with those credentials at `http://localhost:5173`.

### Nmap and root privileges (macOS)

Resolving MAC addresses during discovery requires elevated privileges (see
`docs/ARCHITECTURE.md`). For local macOS dev, grant passwordless sudo to just the nmap
binary and set `NMAP_USE_SUDO=true` in `backend/.env`:

```bash
echo "$(whoami) ALL=(root) NOPASSWD: $(which nmap)" | sudo tee /etc/sudoers.d/netsentry-nmap
sudo chmod 440 /etc/sudoers.d/netsentry-nmap
```

On Linux/Docker this isn't needed — the container is granted `NET_ADMIN`/`NET_RAW`
capabilities directly instead (see `docker-compose.yml`).

### Demo history seed script

To backfill a few days of synthetic past scans for devices a real scan has already found
(useful for populating the dashboard's history views before recording a demo, when a live
scan of the real target network isn't possible — e.g. presenting to a jury):

```bash
npm run seed:demo
```

This only adds `scans`/`device_sightings` rows for devices that already exist from a real
scan — it never invents fake devices or MAC addresses.

## Running with Docker

```bash
cp .env.example .env   # fill in real values
docker compose up --build
```

- Frontend: `http://<server-ip>:8080`
- Backend API: `http://<server-ip>:4000`

**Note**: this assumes a Linux Docker host so `network_mode: host` on the backend can see
the real LAN — see `docs/ARCHITECTURE.md`. Docker itself was not available in the
environment this project was initially built in, so the Docker setup is written and
reviewed carefully but not yet run end-to-end; verify with `docker compose up` once Docker
is installed.
