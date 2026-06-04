import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const rawId = resolvedParams?.id?.trim();

    if (!rawId) {
      return NextResponse.json({ error: "Missing institution identifier." }, { status: 400 });
    }

    let queryText = "";
    let queryParams: any[] = [];

    // 🔑 Smart Sniffer: Detect if the param is an integer or a UUID text string
    const isInteger = /^\d+$/.test(rawId);

    if (isInteger) {
      queryText = `SELECT * FROM "College" WHERE id = $1;`;
      queryParams = [parseInt(rawId, 10)];
    } else {
      // If it's a string/UUID, query it directly as text without parsing
      queryText = `SELECT * FROM "College" WHERE id = $1::text OR id::text = $1;`;
      queryParams = [rawId];
    }

    const result = await pool.query(queryText, queryParams);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: `College profile matching "${rawId}" not found in cloud dataset.` },
        { status: 404 }
      );
    }

    const college = result.rows[0];
    const placementText = college.placements || "";

    // Parse the textual placements smoothly
    const avgMatch = placementText.match(/Average Package:\s*(.*?)(?=\s*\||\s*$)/i);
    const highMatch = placementText.match(/Highest Package:\s*(.*?)(?=\s*\.|\s*$)/i);
    const recruiterMatch = placementText.match(/recruiters include\s*(.*)/i) || 
                           placementText.match(/partners include\s*(.*)/i) || 
                           placementText.match(/Recruiters:\s*(.*)/i);

    const enrichData = {
      ...college,
      averagePackageDisplay: avgMatch ? avgMatch[1].trim() : "N/A",
      highestPackageDisplay: highMatch ? highMatch[1].trim() : "N/A",
      coreRecruitersDisplay: recruiterMatch ? recruiterMatch[1].trim() : "N/A"
    };

    return NextResponse.json(enrichData, { status: 200 });
  } catch (error: any) {
    console.error("Single item lookup crash:", error);
    return NextResponse.json(
      { error: "Database internal tracking failure.", details: error.message },
      { status: 500 }
    );
  }
}