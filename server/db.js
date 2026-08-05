import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pino from 'pino';

const logger = pino({ name: 'PrismaDatabase' });

let prismaInstance;
try {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const adapter = new PrismaPg({ connectionString });
  prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (e) {
  logger.error({ error: e.message }, 'Failed to initialize Prisma with driver adapter');
  try {
    const connectionString = process.env.DATABASE_URL;
    const adapter = new PrismaPg({ connectionString });
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

// Handle process termination gracefully
process.on('beforeExit', async () => {
  try {
    await prisma.$disconnect();
    logger.info('Prisma disconnected gracefully.');
  } catch (e) {}
});

export default prisma;
