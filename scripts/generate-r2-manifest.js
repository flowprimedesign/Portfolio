#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_BUCKET = process.env.R2_BUCKET;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET = process.env.R2_SECRET_ACCESS_KEY;
const PUBLIC_BASE =
  process.env.R2_PUBLIC_BASE_URL || process.env.R2_PUBLIC_URL || null;

if (!R2_ENDPOINT || !R2_BUCKET || !ACCESS_KEY || !SECRET) {
  console.error(
    "Missing R2 env vars (R2_ENDPOINT,R2_BUCKET,R2_ACCESS_KEY_ID,R2_SECRET_ACCESS_KEY)"
  );
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT.replace(/\/+$/g, ""),
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET },
  forcePathStyle: true,
});

async function listAll(prefix = "") {
  const items = [];
  let token;
  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: R2_BUCKET,
        Prefix: prefix,
        ContinuationToken: token,
        MaxKeys: 1000,
      })
    );
    (res.Contents || []).forEach((c) => items.push(c));
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return items;
}

async function main() {
  const objs = await listAll("");
  const manifest = {};

  for (const o of objs) {
    if (!o.Key || o.Key.endsWith("/")) continue;
    const key = o.Key;
    const filename = decodeURIComponent(path.basename(key));

    // If PUBLIC_BASE configured, use deterministic public URL
    if (PUBLIC_BASE) {
      manifest[filename] = `${PUBLIC_BASE.replace(
        /\/$/,
        ""
      )}/${encodeURIComponent(key)}`;
      continue;
    }

    // Otherwise generate presigned GET (24h)
    try {
      const url = await getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }),
        { expiresIn: 3600 * 24 }
      );
      manifest[filename] = url;
    } catch (e) {
      console.error("Presign failed for", key, e && e.stack ? e.stack : e);
    }
  }

  fs.mkdirSync("public", { recursive: true });
  fs.writeFileSync(
    "public/r2-manifest.json",
    JSON.stringify(manifest, null, 2)
  );
  console.log(
    "Wrote public/r2-manifest.json with",
    Object.keys(manifest).length,
    "entries"
  );
}

main().catch((e) => {
  console.error(e && e.stack ? e.stack : e);
  process.exit(2);
});
