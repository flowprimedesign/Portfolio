import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_BUCKET = process.env.R2_BUCKET;
const R2_ENDPOINT = process.env.R2_ENDPOINT || process.env.R2_PUBLIC_URL;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET = process.env.R2_SECRET_ACCESS_KEY;

function makeClient() {
  if (!R2_ENDPOINT || !ACCESS_KEY || !SECRET) {
    throw new Error(
      "R2 config missing; set R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY"
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT.replace(/\/+$/, ""),
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET,
    },
    // Use path-style addressing to avoid virtual-hosted bucket subdomain TLS/SNI issues
    // (some environments / certs don't present a cert for bucket.account.r2...)
    forcePathStyle: true,
  });
}

export async function getPresignedPutUrl(
  key: string,
  contentType = "application/octet-stream",
  expires = 900
) {
  const client = makeClient();
  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, cmd, { expiresIn: expires });
}

export function publicUrlForKey(key: string) {
  if (!R2_ENDPOINT || !R2_BUCKET) return null;
  const endpoint = R2_ENDPOINT.replace(/\/+$/, "");
  if (endpoint.includes(R2_BUCKET)) return `${endpoint}/${key}`;
  return `${endpoint}/${R2_BUCKET}/${key}`;
}

export default { getPresignedPutUrl, publicUrlForKey };
