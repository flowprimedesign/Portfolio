#!/usr/bin/env node
const fs = require('fs');
const envRaw = fs.readFileSync('.env','utf8');
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
if (!env.DATABASE_URL) {
  console.error('No DATABASE_URL in .env');
  process.exit(2);
}
const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  try {
    const res = await pool.query('SELECT filename, url, size, uploaded_at FROM images ORDER BY uploaded_at DESC LIMIT 200');
    console.log('rows:', res.rows.length);
    res.rows.forEach(r => console.log(r.filename, '->', r.url, r.size));
    await pool.end();
  } catch (e) {
    console.error('Query failed:', e && e.stack ? e.stack : e);
    process.exit(3);
  }
})();
