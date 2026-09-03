import bcrypt from 'bcryptjs';
import { env } from './config/env.js';
import { runMigrations } from './db/migrate.js';
import { countUsers, createUser } from './models/userModel.js';
import { createApp } from './app.js';
import { startScheduler } from './services/schedulerService.js';
import { logger } from './utils/logger.js';

async function seedAdminUser() {
  const existing = await countUsers();
  if (existing > 0) return;

  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  await createUser({ username: env.adminUsername, passwordHash });
  logger.warn(
    `Seeded initial admin user "${env.adminUsername}" from ADMIN_USERNAME/ADMIN_PASSWORD. ` +
      'Consider rotating the password after first login.'
  );
}

async function main() {
  await runMigrations();
  await seedAdminUser();

  const app = createApp();
  app.listen(env.port, () => {
    logger.info(`NetSentry backend listening on port ${env.port}`);
  });

  startScheduler();
}

main().catch((err) => {
  logger.error('Fatal error during startup', err);
  process.exit(1);
});
