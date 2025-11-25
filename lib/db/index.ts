import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || "";

export const pool = new Pool({ connectionString });

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export async function ensureImagesTable() {
  await query(`
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

export default {
  pool,
  query,
  ensureImagesTable,
};
