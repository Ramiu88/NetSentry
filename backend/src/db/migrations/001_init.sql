-- NetSentry initial schema.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS devices (
  id            SERIAL PRIMARY KEY,
  mac_address   MACADDR UNIQUE NOT NULL,
  vendor        TEXT,
  hostname      TEXT,
  device_type   TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_known      BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  notes         TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scans (
  id            SERIAL PRIMARY KEY,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at   TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'running',
  trigger       TEXT NOT NULL DEFAULT 'manual',
  target_cidr   TEXT NOT NULL,
  hosts_found   INTEGER,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS device_sightings (
  id            SERIAL PRIMARY KEY,
  scan_id       INTEGER NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  device_id     INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  ip_address    INET NOT NULL,
  open_ports    JSONB,
  os_guess      TEXT,
  seen_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scan_id, device_id)
);
CREATE INDEX IF NOT EXISTS idx_sightings_device ON device_sightings(device_id, seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_sightings_scan ON device_sightings(scan_id);

CREATE TABLE IF NOT EXISTS alerts (
  id              SERIAL PRIMARY KEY,
  device_id       INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  scan_id         INTEGER REFERENCES scans(id) ON DELETE SET NULL,
  type            TEXT NOT NULL,
  message         TEXT NOT NULL,
  is_acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_alerts_unack ON alerts(is_acknowledged, created_at DESC);
