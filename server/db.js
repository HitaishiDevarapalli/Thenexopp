import { PrismaClient } from '@prisma/client';
import pino from 'pino';

const logger = pino({ name: 'PrismaDatabase' });

let prismaInstance;
try {
  prismaInstance = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (e) {
  logger.error({ error: e.message }, 'Failed to initialize PrismaClient');
  prismaInstance = new PrismaClient();
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
process.on('SIGINT', async () => {
  try {
    await prisma.$disconnect();
  } catch (e) {}
  process.exit(0);
});


export default prisma;
