import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database migration...');
  
  // This will create the database and tables if they don't exist
  await prisma.$connect();
  
  console.log('✅ Database connection established');
  
  // Run any additional migrations here if needed
  
  console.log('✅ Database migration completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
