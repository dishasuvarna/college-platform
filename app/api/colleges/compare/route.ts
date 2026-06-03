import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsString = searchParams.get('ids');

    if (!idsString) {
      return NextResponse.json({ error: "Missing ids query parameter." }, { status: 400 });
    }

    // Convert comma-separated string "1,2,3" into an array of integers [1, 2, 3]
    const collegeIds = idsString.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));

    if (collegeIds.length === 0) {
      return NextResponse.json({ error: "No valid institution identifiers provided." }, { status: 400 });
    }

    // Query Postgres using the ANY operator for optimal batch fetching
    const result = await pool.query(
      'SELECT * FROM "College" WHERE id = ANY($1::int[]);',
      [collegeIds]
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("Batch query exception:", error);
    return NextResponse.json(
      { error: "Internal database query exception.", details: error.message },
      { status: 500 }
    );
  }
}