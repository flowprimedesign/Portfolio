import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const filename = url.searchParams.get("filename");
    const key = url.searchParams.get("key");

    if (!filename && !key) {
      return NextResponse.json(
        { error: "missing filename or key" },
        { status: 400 }
      );
    }

    let query = "SELECT * FROM images WHERE ";
    const values: any[] = [];
    if (filename) {
      query += "filename = $1 LIMIT 1";
      values.push(filename);
    } else {
      query += "url LIKE $1 LIMIT 1";
      // key may be a path like uploads/..., match end of URL
      values.push(`%/${key}`);
    }

    const res = await db.query(query, values);
    const row = res.rows?.[0] || null;
    return NextResponse.json({ ok: true, row });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
