/**
 * Wait for database to be ready before proceeding
 */
import { prisma } from '../lib/prisma';

const MAX_RETRIES = 30;
const RETRY_DELAY = 1000;

async function waitForDb(): Promise<void> {
  console.log('⏳ Waiting for database to be ready...');
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database is ready!');
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.log(`   Attempt ${i + 1}/${MAX_RETRIES} - Database not ready yet...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  console.error('❌ Database failed to become ready after', MAX_RETRIES, 'attempts');
  process.exit(1);
}

waitForDb();
