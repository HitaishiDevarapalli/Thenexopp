import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatic .env loading across root, server, and production directories
const candidateEnvPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server/.env'),
  '/var/www/thenexopp/.env',
];

candidateEnvPaths.forEach((envPath) => {
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  } catch (_) {}
});

const logger = pino({ name: 'PrismaDatabase' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  logger.warn('DATABASE_URL environment variable is not set; initializing safe fallback mode.');
}

const pool = new pg.Pool(connectionString ? { connectionString } : {});
pool.on('error', (err) => {
  logger.error({ error: err.message }, 'Unexpected PostgreSQL pool error');
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Test and handle database connection gracefully
export const checkDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL Prisma database connection established successfully.');
    return true;
  } catch (error) {
    logger.warn({ error: error.message }, 'PostgreSQL DB connection unavailable; operating with fallback data handler.');
    return false;
  }
};

// Graceful shutdown — handles PM2 SIGINT/SIGTERM signals
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Disconnecting Prisma...`);
  try {
    await prisma.$disconnect();
    await pool.end();
    logger.info('Prisma disconnected gracefully.');
  } catch (e) {
    logger.error({ error: e.message }, 'Error during graceful shutdown');
  }
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default prisma;
