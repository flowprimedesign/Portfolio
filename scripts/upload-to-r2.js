#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Pool } = require("pg");
const mime = require("mime");

// Configuration from env
const R2_ENDPOINT = process.env.R2_ENDPOINT || process.env.R2_PUBLIC_URL;
const R2_BUCKET = process.env.R2_BUCKET;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET = process.env.R2_SECRET_ACCESS_KEY;
const PUBLIC_BASE = process.env.R2_PUBLIC_BASE_URL || process.env.R2_PUBLIC_URL;
const DATABASE_URL = process.env.DATABASE_URL;

if (!R2_ENDPOINT || !R2_BUCKET || !ACCESS_KEY || !SECRET) {
  console.error(
    "Missing R2 env vars. Please set R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY"
  );
  process.exit(2);
}

if (!DATABASE_URL) {
  console.error(
    "Missing DATABASE_URL; required to insert image metadata into DB"
  );
  process.exit(3);
}

const client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT.replace(/\/+$/g, ""),
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET },
  forcePathStyle: true,
});

const pool = new Pool({ connectionString: DATABASE_URL });

async function ensureTable() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE TABLE IF NOT EXISTS images (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      filename text NOT NULL,
      url text NOT NULL,
      size bigint,
      mime text,
      uploaded_at timestamptz DEFAULT now(),
      source_path text
    );
  `);
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walkDir(full));
    else if (e.isFile()) files.push(full);
  }
  return files;
}

async function uploadFile(filePath) {
  const filename = path.basename(filePath);
  const key = `uploads/${Date.now()}-${filename}`;
  const contentType = mime.getType(filePath) || "application/octet-stream";
  const stream = fs.createReadStream(filePath);

  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: stream,
    ContentType: contentType,
  });

  try {
    await client.send(cmd);
  } catch (err) {
    console.error(
      "Upload failed for",
      filePath,
      err && err.stack ? err.stack : err
    );
    throw err;
  }

  const publicUrl = PUBLIC_BASE
    ? `${PUBLIC_BASE.replace(/\/$/, "")}/${encodeURIComponent(key)}`
    : `${R2_ENDPOINT.replace(/\/$/, "")}/${R2_BUCKET}/${encodeURIComponent(
        key
      )}`;

  // Insert metadata into DB
  const stat = fs.statSync(filePath);
  const insert = `INSERT INTO images (filename, url, size, mime, source_path) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
  const values = [filename, publicUrl, stat.size, contentType, filePath];
  const res = await pool.query(insert, values);
  return res.rows?.[0] || null;
}

async function main() {
  const dir = process.argv[2] || path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(dir)) {
    console.error("Upload directory not found:", dir);
    process.exit(4);
  }

  await ensureTable();

  const files = walkDir(dir).filter((p) => !p.endsWith(".DS_Store"));
  if (files.length === 0) {
    console.log("No files found in", dir);
    process.exit(0);
  }

  for (const file of files) {
    try {
      console.log("Uploading:", file);
      const row = await uploadFile(file);
      console.log("Uploaded and recorded:", row?.id, row?.url);
    } catch (err) {
      console.error(
        "Failed to process",
        file,
        err && err.stack ? err.stack : err
      );
    }
  }

  await pool.end();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e && e.stack ? e.stack : e);
  process.exit(99);
});
