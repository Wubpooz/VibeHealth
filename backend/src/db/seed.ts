/**
 * Database seed script for development
 * Creates a test user for quick login
 */
import { prisma } from '../lib/prisma';
import { seedActivityCatalog } from './activity-catalog.seed';
import { seedExerciseCatalog } from './exercise-catalog.seed';
import { seedMealCatalog } from './meal-catalog.seed';

async function seed(): Promise<void> {
  console.log('🌱 Seeding database...');

  await seedActivityCatalog();
  await seedExerciseCatalog();
  await seedMealCatalog();

  // Check if test user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'test@vibehealth.dev' },
  });

  if (existingUser) {
    console.log('   Test user already exists, skipping...');
  } else {
    // Create a pre-verified test user
    // Note: In dev mode, you can also register new users normally
    // This is just for quick testing
    await prisma.user.create({
      data: {
        email: 'test@vibehealth.dev',
        name: 'Test User',
        emailVerified: true,
        role: 'USER',
      },
    });
    console.log('   ✓ Created test user: test@vibehealth.dev');
  }

  console.log('✅ Seeding complete!');
  console.log('');
  console.log('📝 Dev Notes:');
  console.log('   - Register new users at http://localhost:4200/register');
  console.log('   - Check console for verification email links (dev mode)');
  console.log('   - Or use Prisma Studio to verify users: bun run db:studio');
  
  await prisma.$disconnect();
}

try {
  await seed();
} catch (e) {
  console.error('❌ Seeding failed:', e);
  process.exit(1);
}
