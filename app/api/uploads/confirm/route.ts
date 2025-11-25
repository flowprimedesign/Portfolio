import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { key, filename, size, mime, publicUrl, source_path } = payload;
    if (!key || !filename) {
      return NextResponse.json(
        { error: "missing key or filename" },
        { status: 400 }
      );
    }

    const insert = `INSERT INTO images (filename, url, size, mime, source_path) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [
      filename,
      publicUrl || null,
      size || null,
      mime || null,
      source_path || null,
    ];
    const res = await db.query(insert, values);
    return NextResponse.json({ ok: true, row: res.rows?.[0] || null });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
