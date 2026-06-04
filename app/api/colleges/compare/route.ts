import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const maxFees = parseInt(searchParams.get('maxFees') || '600000', 10);
    const sortBy = searchParams.get('sortBy') || 'name'; // Default sort fallback

    // Map frontend dropdown keys to strict, safe SQL column clauses
    let orderClause = 'name ASC';
    if (sortBy === 'fees_low') orderClause = 'fees ASC';
    if (sortBy === 'rating_high') orderClause = 'rating DESC';
    if (sortBy === 'placement_high') orderClause = '(placements->>\'average\')::int DESC';

    // Constructing query safely using parameterized values for security
    const query = `
      SELECT * FROM "College" 
      WHERE (name ILIKE $1 OR overview ILIKE $1) 
      AND fees <= $2
      ORDER BY ${orderClause};
    `;

    const result = await pool.query(query, [`%${search}%`, maxFees]);
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("Database query exception:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}