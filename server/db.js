import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import pino from 'pino';

const logger = pino({ name: 'PrismaDatabase' });

let prismaInstance;
let pgPool;
try {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  // Create a pg Pool with a limited connection count to prevent exhaustion
  pgPool = new pg.Pool({
    connectionString,
    max: 5,                   // Max 5 connections (prevents hitting PostgreSQL limit)
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 10000,
  });
  const adapter = new PrismaPg({ pool: pgPool });
  prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (e) {
  logger.error({ error: e.message }, 'Failed to initialize Prisma with driver adapter');
  try {
    const connectionString = process.env.DATABASE_URL;
    pgPool = new pg.Pool({ connectionString, max: 5 });
    const adapter = new PrismaPg({ pool: pgPool });
    prismaInstance = new PrismaClient({ adapter });
  } catch (e2) {
    logger.error({ error: e2.message }, 'Prisma fallback initialization also failed');
    process.exit(1);
  }
}

export const prisma = prismaInstance;

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

// Graceful shutdown — handles PM2 SIGINT/SIGTERM signals (beforeExit does NOT fire on kill signals)
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Disconnecting Prisma and closing pool...`);
  try {
    await prisma.$disconnect();
    if (pgPool) await pgPool.end();
    logger.info('Prisma and pg pool disconnected gracefully.');
  } catch (e) {
    logger.error({ error: e.message }, 'Error during graceful shutdown');
  }
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default prisma;
