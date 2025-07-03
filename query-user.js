import { PrismaClient } from '@prisma/client';

// Set up environment variables
process.env.DATABASE_URL = "postgresql://streemr_user:uy9IcetHC6stgDxvTT5ZewRMGk5pTbDY@dpg-d1iuiqemcj7s739ua480-a.oregon-postgres.render.com/streemr";

// Initialize Prisma client
const prisma = new PrismaClient();

async function queryUser() {
  try {
    console.log('Connecting to database...');
    
    // Query for user with email crisjanz@gmail.com
    const user = await prisma.user.findUnique({
      where: {
        email: 'crisjanz@gmail.com'
      }
    });
    
    console.log('=== USER QUERY RESULTS ===');
    
    if (user) {
      console.log('✅ User found!');
      console.log('User ID:', user.id);
      console.log('Email:', user.email);
      console.log('Created At:', user.createdAt);
      console.log('Updated At:', user.updatedAt);
      console.log('Has Reset Token:', user.resetToken ? 'Yes' : 'No');
      console.log('Reset Token Expiry:', user.resetTokenExpiry || 'N/A');
    } else {
      console.log('❌ User not found in database');
    }
    
    // Also check if there are any users at all
    const userCount = await prisma.user.count();
    console.log('\n=== DATABASE STATS ===');
    console.log('Total users in database:', userCount);
    
    // List all users (just emails for privacy)
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });
    
    console.log('\n=== ALL USERS ===');
    allUsers.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Created: ${user.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryUser();