import { PrismaClient } from '@prisma/client';
import pino from 'pino';

const logger = pino({ name: 'PrismaDatabase' });

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
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

// Handle process termination gracefully
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Prisma disconnected gracefully.');
});

export default prisma;
