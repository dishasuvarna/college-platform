// prisma/seed.js
const { Pool } = require('pg');
require('dotenv').config();

// Connect directly to your Neon PostgreSQL instance using your environment string
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Ensures smooth cloud SSL handshake
});

async function main() {
  console.log('🔗 Connecting directly to Neon cloud database...');

  // 1. Find out exactly what your table is actually named in Postgres
  const tableCheck = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `);
  
  const existingTables = tableCheck.rows.map(row => row.table_name);
  console.log('🔍 Discovered active database tables:', existingTables);

  // 2. Identify if the table is named "College", "college", or "colleges"
  let targetTable = existingTables.find(t => t.toLowerCase() === 'college');
  
  if (!targetTable) {
    // If npx prisma db push hasn't actually created the table yet, let's build it right now!
    console.log('⚠️ College table not found in database. Building it automatically...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "College" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        fees INT NOT NULL,
        rating NUMERIC(3,2) NOT NULL,
        overview TEXT NOT NULL,
        courses TEXT[] NOT NULL,
        placements JSONB NOT NULL
      );
    `);
    targetTable = 'College';
  }

  console.log(`🧼 Cleaning up old records in table: "${targetTable}"...`);
  await pool.query(`DELETE FROM "${targetTable}";`);

  // 3. Define our rich educational dataset
  const collegesToSeed = [
    {
      name: "Indian Institute of Technology (IIT)",
      location: "Mumbai, Maharashtra",
      fees: 220000,
      rating: 4.9,
      overview: "A premier public technical and research university known for its rigorous academic programs.",
      courses: ["Computer Science Engineering", "Electrical Engineering", "Data Science & AI"],
      placements: JSON.stringify({ highest: 4800000, average: 1600000, topRecruiters: ["Google", "Microsoft"] })
    },
    {
      name: "National Institute of Technology (NIT)",
      location: "Surathkal, Karnataka",
      fees: 150000,
      rating: 4.5,
      overview: "One of India's top tier-1 engineering institutions with excellent placements.",
      courses: ["Information Technology", "Computer Science Engineering"],
      placements: JSON.stringify({ highest: 3600000, average: 1250000, topRecruiters: ["Amazon", "Uber"] })
    }
  ];

  // 4. Inject records directly via atomic SQL inserts
  console.log('🌱 Pushing fresh college profiles into Neon...');
  for (const college of collegesToSeed) {
    await pool.query(
      `INSERT INTO "${targetTable}" (name, location, fees, rating, overview, courses, placements) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [college.name, college.location, college.fees, college.rating, college.overview, college.courses, college.placements]
    );
  }

  console.log('✅ Success! Database seeded natively with direct SQL connections.');
}

main()
  .catch((e) => {
    console.error('❌ Direct seeding failed:', e.message);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });