import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids")?.split(",") || [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    // 🔑 Use ANY($1) to handle UUID array matching safely
    const queryText = `SELECT * FROM "College" WHERE id::text = ANY($1);`;
    const result = await pool.query(queryText, [ids]);

    const processedData = result.rows.map((college) => {
      const placementText = college.placements || "";
      const avgMatch = placementText.match(/Average Package:\s*([₹\d\.]+\s*(?:LPA|Crore|K)?)/i);
      const highMatch = placementText.match(/Highest Package:\s*([₹\d\.]+\s*(?:LPA|Crore|K)?)/i);
      const recruiterMatch = placementText.match(/(?:include|recruiters|partners)\s+([^.]+)/i) || 
                             placementText.match(/([A-Z][a-zA-Z\s]+(?:,\s*[A-Z][a-zA-Z\s]+)*\s+recruit(?:s|ed| heavily)?)/i);

      return {
        ...college,
        averagePackageDisplay: avgMatch ? avgMatch[1].trim() : "N/A",
        highestPackageDisplay: highMatch ? highMatch[1].trim() : "N/A",
        coreRecruitersDisplay: recruiterMatch ? recruiterMatch[1].trim() : "N/A"
      };
    });

    return NextResponse.json(processedData, { status: 200 });
  } catch (error: any) {
    console.error("Comparison API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}