#!/usr/bin/env node
const fs = require('fs');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// load .env from repo root
const envRaw = fs.readFileSync('.env', 'utf8');
const env = {};

envRaw.split(/\n/).forEach((line) => {
  if (!line || line.trim().startsWith('#')) return;
  const idx = line.indexOf('=');
  if (idx === -1) return;
  const key = line.slice(0, idx).trim();
  let val = line.slice(idx + 1).trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  env[key] = val;
});

if (!env.R2_ENDPOINT || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET) {
  console.error('Missing R2 vars in .env');
  process.exit(2);
}

const client = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT.replace(/\/+$/, ''),
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
  forcePathStyle: true,
});

(async () => {
  try {
    const res = await client.send(new ListObjectsV2Command({ Bucket: env.R2_BUCKET, MaxKeys: 500 }));
    const list = res.Contents || [];
    console.log('Found', list.length, 'objects');
    list.forEach((o) => console.log('-', o.Key, o.Size));
  } catch (err) {
    console.error('List failed:', err && err.stack ? err.stack : err);
    process.exit(3);
  }
})();
