import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    if (!key)
      return NextResponse.json({ error: "missing key" }, { status: 400 });

    const R2_ENDPOINT = process.env.R2_ENDPOINT || process.env.R2_PUBLIC_URL;
    const R2_BUCKET = process.env.R2_BUCKET;
    const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
    const SECRET = process.env.R2_SECRET_ACCESS_KEY;

    if (!R2_ENDPOINT || !R2_BUCKET || !ACCESS_KEY || !SECRET) {
      return NextResponse.json({ error: "R2 config missing" }, { status: 500 });
    }

    const client = new S3Client({
      region: "auto",
      endpoint: R2_ENDPOINT.replace(/\/+$/g, ""),
      credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET },
      forcePathStyle: true,
    });

    const cmd = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key });
    const res = await client.send(cmd);

    const headers: Record<string, string> = {};
    if (res.ContentType) headers["content-type"] = res.ContentType;
    headers["access-control-allow-origin"] = "*";

    // `res.Body` is a stream.Readable in Node; NextResponse can stream it directly
    return new NextResponse(res.Body as any, { headers });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
