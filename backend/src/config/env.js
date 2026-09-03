import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const databaseUrl =
  process.env.DATABASE_URL ||
  (process.env.PGHOST
    ? `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE}`
    : null);

if (!databaseUrl) {
  throw new Error(
    'Missing required environment variable: DATABASE_URL (or PGHOST/PGUSER/PGPASSWORD/PGDATABASE)'
  );
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl,
  jwtSecret: required('JWT_SECRET'),
  adminUsername: required('ADMIN_USERNAME'),
  adminPassword: required('ADMIN_PASSWORD'),
  scanTargetCidr: process.env.SCAN_TARGET_CIDR || '192.168.1.0/24',
  scanCronSchedule: process.env.SCAN_CRON_SCHEDULE || '*/30 * * * *',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  // macOS local dev needs `sudo nmap` for ARP-based MAC address resolution
  // (see /etc/sudoers.d/netsentry-nmap, scoped to just the nmap binary).
  // In Docker on Linux the backend container is granted NET_ADMIN/NET_RAW
  // capabilities directly, so nmap already has what it needs without sudo.
  nmapUseSudo: process.env.NMAP_USE_SUDO === 'true',
};
