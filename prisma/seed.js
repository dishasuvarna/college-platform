// 🔑 Change this line to point directly to where your schema output puts it!
const { PrismaClient } = require('../node_modules/@prisma/client'); 
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ... rest of your seed file remains exactly the same!

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear out old database structures to stay clean
  await prisma.college.deleteMany({});

  // 2. Insert the complete MVP dataset profiles
  await prisma.college.createMany({
    data: [
      {
        name: "Indian Institute of Technology (IIT) Bombay",
        location: "Mumbai, Maharashtra",
        fees: 220000,
        rating: 4.9,
        overview: "A premier engineering institution known globally for academic excellence, cutting-edge research infrastructure, and vibrant campus life.",
        courses: "B.Tech Computer Science, B.Tech Electrical Engineering, M.Tech Data Science",
        placements: "Average Package: ₹21.8 LPA | Highest Package: ₹1.3 Crore LPA. Top recruiters include Google, Microsoft, and Qualcomm.",
        examRequired: "JEE",
        cutoffRank: 100,
      },
      {
        name: "BITS Pilani",
        location: "Pilani, Rajasthan",
        fees: 550000,
        rating: 4.7,
        overview: "A top-tier private deemed university renowned for its 'No Reservation' policy, flexible academic structure, and strong global alumni network.",
        courses: "B.E. Computer Science, B.E. Electronics & Communication, M.Sc. Economics",
        placements: "Average Package: ₹15.6 LPA | Highest Package: ₹60 LPA. Key partners include Apple, Uber, and Goldman Sachs.",
        examRequired: "BITSAT",
        cutoffRank: 320,
      },
      {
        name: "Vellore Institute of Technology (VIT)",
        location: "Vellore, Tamil Nadu",
        fees: 198000,
        rating: 4.2,
        overview: "A massive, state-of-the-art private institution known for high international exposure, structured credit options, and massive volume placements.",
        courses: "B.Tech Information Technology, B.Tech Bio-Medical, MCA",
        placements: "Average Package: ₹8.2 LPA | Highest Package: ₹44 LPA. Amazon, TCS, and Cognizant recruit heavily here.",
        examRequired: "VITEEE",
        cutoffRank: 8000,
      },
    ],
  });

  console.log('✅ Database successfully seeded with full Track B MVP data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Clean up the connection pool
  });