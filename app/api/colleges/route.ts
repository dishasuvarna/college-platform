// app/api/colleges/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(request: Request) {
  try {
    // 1. Extract query parameters from the requested URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const maxFees = searchParams.get('maxFees');
    const minRating = searchParams.get('minRating');

    // 2. Build our dynamic SQL query structurally
    let queryText = 'SELECT * FROM "College" WHERE 1=1';
    const queryValues: any[] = [];
    let paramCounter = 1;

    // Handle text searching (matches name or location case-insensitively)
    if (search) {
      queryText += ` AND (name ILIKE $${paramCounter} OR location ILIKE $${paramCounter})`;
      queryValues.push(`%${search}%`);
      paramCounter++;
    }

    // Handle max fees filter
    if (maxFees) {
      queryText += ` AND fees <= $${paramCounter}`;
      queryValues.push(parseInt(maxFees, 10));
      paramCounter++;
    }

    // Handle minimum rating filter
    if (minRating) {
      queryText += ` AND rating >= $${paramCounter}`;
      queryValues.push(parseFloat(minRating));
      paramCounter++;
    }

    // Sort results by rating descending by default
    queryText += ' ORDER BY rating DESC;';

    // 3. Execute the parameterized query against Neon Postgres
    const result = await pool.query(queryText, queryValues);
    
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("Advanced search API exception:", error);
    return NextResponse.json(
      { error: "Failed to execute search query calculation.", details: error.message },
      { status: 500 }
    );
  }
}