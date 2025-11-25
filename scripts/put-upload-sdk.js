#!/usr/bin/env node
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

async function main() {
  const [, , bucket, key, filePath, contentType = "application/octet-stream"] =
    process.argv;
  if (!bucket || !key || !filePath) {
    console.error(
      "Usage: node put-upload-sdk.js <bucket> <key> <filePath> <contentType>"
    );
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(2);
  }

  const R2_ENDPOINT = process.env.R2_ENDPOINT || process.env.R2_PUBLIC_URL;
  const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
  const SECRET = process.env.R2_SECRET_ACCESS_KEY;

  if (!R2_ENDPOINT || !ACCESS_KEY || !SECRET) {
    console.error(
      "Missing R2 env vars: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY"
    );
    process.exit(3);
  }

  const client = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT.replace(/\/+$/, ""),
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET,
    },
    // Use path-style addressing to avoid virtual-hosted bucket subdomain TLS/SNI issues
    forcePathStyle: true,
  });

  const bodyStream = fs.createReadStream(filePath);
  const params = {
    Bucket: bucket,
    Key: key,
    Body: bodyStream,
    ContentType: contentType,
  };

  try {
    const cmd = new PutObjectCommand(params);
    const res = await client.send(cmd);
    console.log(
      "Upload succeeded (sdk):",
      filePath,
      "->",
      key,
      "response:",
      res
    );
    process.exit(0);
  } catch (err) {
    console.error("SDK upload failed:", err && err.stack ? err.stack : err);
    process.exit(4);
  }
}

main();
