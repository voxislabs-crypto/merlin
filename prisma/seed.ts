import { prisma } from '../lib/db.js';

async function main() {
  console.log('🌱 Seeding database...');
  
  // Add any initial data here
  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
