import { NextResponse } from "next/server";
import { getPresignedPutUrl, publicUrlForKey } from "../../../lib/r2";

export async function POST(req: Request) {
  try {
    const { filename, contentType } = await req.json();
    const key = `uploads/${Date.now()}-${filename}`;
    try {
      const url = await getPresignedPutUrl(key, contentType);
      const publicUrl = publicUrlForKey(key);
      return NextResponse.json({ url, key, publicUrl });
    } catch (err) {
      // Log detailed error on the server for debugging
      console.error("/api/upload-url error while creating presigned URL:", err);
      const e = err as Error;
      // In development, include the stack so scripts can surface the problem.
      const body: any = { error: e.message };
      if (process.env.NODE_ENV !== "production" && e.stack)
        body.stack = e.stack;
      return NextResponse.json(body, { status: 500 });
    }
  } catch (err) {
    console.error("/api/upload-url received invalid request:", err);
    const e = err as Error;
    const body: any = { error: e.message };
    if (process.env.NODE_ENV !== "production" && e.stack) body.stack = e.stack;
    return NextResponse.json(body, { status: 400 });
  }
}
