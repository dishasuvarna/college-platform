import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const collegeId = parseInt(resolvedParams.id, 10);

    if (isNaN(collegeId)) {
      return NextResponse.json({ error: "Invalid institution ID parameter." }, { status: 400 });
    }

    const result = await pool.query('SELECT * FROM "College" WHERE id = $1;', [collegeId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "College listing not found in cloud dataset." }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: any) {
    console.error("Single institution fetch exception:", error);
    return NextResponse.json(
      { error: "Internal database query exception.", details: error.message },
      { status: 500 }
    );
  }
}