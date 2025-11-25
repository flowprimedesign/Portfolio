#!/usr/bin/env node
const fs = require("fs");
const { Client } = require("pg");
const path = require("path");

async function main() {
  // If DATABASE_URL is not set in the environment, attempt to load from .env.local or .env
  if (!process.env.DATABASE_URL) {
    const envFiles = [
      path.resolve(__dirname, "../.env.local"),
      path.resolve(__dirname, "../.env"),
    ];
    for (const f of envFiles) {
      if (fs.existsSync(f)) {
        const contents = fs.readFileSync(f, "utf8");
        contents.split(/\r?\n/).forEach((line) => {
          const m = line.match(
            /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(.*))\s*$/
          );
          if (m) {
            const key = m[1];
            const val = m[2] ?? m[3] ?? m[4] ?? "";
            if (!process.env[key]) process.env[key] = val;
          }
        });
      }
    }
  }

  const sql = fs.readFileSync(
    path.resolve(__dirname, "../migrations/001_create_images.sql"),
    "utf8"
  );
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(
      "DATABASE_URL not set in environment. Create a .env.local with DATABASE_URL or export it in your shell."
    );
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    console.log("Running migration...");
    await client.query(sql);
    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err.message || err);
    process.exit(2);
  } finally {
    await client.end();
  }
}

main();
