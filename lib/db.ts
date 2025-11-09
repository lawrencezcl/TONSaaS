import { PrismaClient } from '@prisma/client';
import { mockPrisma } from './mock-db';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Try to use real Prisma, fall back to mock if database not configured
let prismaInstance: any;

try {
  if (process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL) {
    prismaInstance =
      globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance;
    }
  } else {
    console.warn('⚠️  No database configured, using in-memory mock database');
    prismaInstance = mockPrisma;
  }
} catch (error) {
  console.warn('⚠️  Database connection failed, using in-memory mock database');
  prismaInstance = mockPrisma;
}

export const prisma = prismaInstance;
