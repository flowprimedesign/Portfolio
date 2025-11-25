# Neon + Cloudflare R2 scaffold

This folder contains simple notes and pointers for deploying the portfolio with Neon (Postgres), Cloudflare R2 for object storage, and Vercel for hosting.

Recommended workflow:

1. Create a Neon database and set `DATABASE_URL` in your Vercel and local `.env`.
2. Create a Cloudflare R2 bucket and set `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_PUBLIC_URL`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY`.
3. Run the SQL migration in `migrations/001_create_images.sql` against your Neon database.
4. Start your Next dev server and run `scripts/migrate-assets.sh` to push `public/` assets to R2 (this script calls the `/api/upload-url` endpoint and then PUTs files to the returned URL).

Notes:

- The `lib/r2` implementation is a placeholder. Replace `getPresignedPutUrl` with a real presigner (AWS SDK v3 S3RequestPresigner or a Cloudflare worker) before running real uploads.
- You may want to restrict the upload route with authentication (server-only service role key) when used in production.

Dependencies:

- Install the AWS SDK v3 presigner and Postgres client locally before running uploads:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner pg
```

After installing, set the environment variables in `.env` or your deployment platform and run the migration script.
