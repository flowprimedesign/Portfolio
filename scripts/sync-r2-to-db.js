#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { Pool } = require("pg");

const envRaw = fs.readFileSync(".env", "utf8");
const env = {};
envRaw.split(/\n/).forEach((line) => {
  if (!line || line.trim().startsWith("#")) return;
  const idx = line.indexOf("=");
  if (idx === -1) return;
  const key = line.slice(0, idx).trim();
  let val = line.slice(idx + 1).trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  env[key] = val;
});

const R2_ENDPOINT = env.R2_ENDPOINT || env.R2_PUBLIC_URL;
const R2_BUCKET = env.R2_BUCKET;
const ACCESS_KEY = env.R2_ACCESS_KEY_ID;
const SECRET = env.R2_SECRET_ACCESS_KEY;
const PUBLIC_BASE = env.R2_PUBLIC_BASE_URL || env.R2_PUBLIC_URL;
const DATABASE_URL = env.DATABASE_URL;

if (!R2_ENDPOINT || !R2_BUCKET || !ACCESS_KEY || !SECRET) {
  console.error("Missing R2 env vars");
  process.exit(2);
}
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL");
  process.exit(3);
}

const client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT.replace(/\/+$/g, ""),
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET },
  forcePathStyle: true,
});

const pool = new Pool({ connectionString: DATABASE_URL });

function basenameKey(key) {
  return path.basename(decodeURIComponent(key));
}

async function listAll(prefix = "") {
  const objs = [];
  let ContinuationToken = undefined;
  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: R2_BUCKET,
        Prefix: prefix,
        ContinuationToken,
        MaxKeys: 1000,
      })
    );
    (res.Contents || []).forEach((c) => objs.push(c));
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return objs;
}

async function main() {
  console.log("Listing R2 objects...");
  const objs = await listAll("");
  console.log("Found", objs.length, "objects");

  for (const o of objs) {
    if (!o.Key) continue;
    if (o.Key.endsWith("/")) continue;
    const filename = basenameKey(o.Key);
    try {
      const q = await pool.query(
        "SELECT id FROM images WHERE filename = $1 LIMIT 1",
        [filename]
      );
      if (q.rows && q.rows.length > 0) {
        // already present
        continue;
      }
      const publicUrl = PUBLIC_BASE
        ? `${PUBLIC_BASE.replace(/\/$/, "")}/${encodeURIComponent(o.Key)}`
        : `${R2_ENDPOINT.replace(/\/$/, "")}/${R2_BUCKET}/${encodeURIComponent(
            o.Key
          )}`;
      await pool.query(
        "INSERT INTO images (filename, url, size, mime, source_path) VALUES ($1,$2,$3,$4,$5)",
        [
          filename,
          publicUrl,
          o.Size || null,
          null,
          `r2://${R2_BUCKET}/${o.Key}`,
        ]
      );
      console.log("Inserted", filename);
    } catch (e) {
      console.error("Error processing", o.Key, e && e.stack ? e.stack : e);
    }
  }

  await pool.end();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e && e.stack ? e.stack : e);
  process.exit(99);
});
