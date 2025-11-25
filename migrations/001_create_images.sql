-- Migration: create images table
-- Enables pgcrypto for gen_random_uuid()
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
