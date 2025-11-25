#!/usr/bin/env bash
set -euo pipefail

# Simple migration script (scaffold) that calls your app's upload-url endpoint
# for each file under `public/` and then uploads the file via the returned URL.
#
# Requirements:
# - Your dev server running (default BASE_URL=http://localhost:3000)
# - `jq` and `file` commands installed on your machine
# - The app/api/upload-url route must return a JSON `{ url, key }` for POST { filename, contentType }

BASE_URL=${BASE_URL:-http://localhost:3000}
PUBLIC_DIR=${PUBLIC_DIR:-public}

if ! command -v jq >/dev/null 2>&1; then
  echo "This script requires 'jq' (install via brew install jq)."
  exit 1
fi

if ! command -v file >/dev/null 2>&1; then
  echo "This script requires the 'file' utility (install via brew install libmagic)."
  exit 1
fi

find "$PUBLIC_DIR" -type f -print0 | while IFS= read -r -d '' file; do
  filename=$(basename "$file")
  mime=$(file --brief --mime-type "$file")
  echo "Uploading: $file (mime=$mime)"

  resp=$(curl -sS -X POST "$BASE_URL/api/upload-url" -H "Content-Type: application/json" -d "{\"filename\":\"$filename\",\"contentType\":\"$mime\"}")

  # Validate JSON response from server before using jq
  if ! echo "$resp" | jq . >/dev/null 2>&1; then
    echo "Invalid JSON response from $BASE_URL/api/upload-url:" >&2
    echo "--- RESPONSE START ---" >&2
    echo "$resp" >&2
    echo "--- RESPONSE END ---" >&2
    echo "Check the Next dev server logs for errors. Exiting." >&2
    exit 5
  fi

  url=$(echo "$resp" | jq -r .url)
  key=$(echo "$resp" | jq -r .key)
  publicUrl=$(echo "$resp" | jq -r .publicUrl)

  if [ -z "$url" ] || [ "$url" = "null" ]; then
    echo "Failed to get presigned URL for $file: $resp"
    exit 1
  fi

  echo "Uploading to: $url"
  # Use Node uploader (fetch) to avoid macOS curl/LibreSSL TLS handshake issues
  if node ./scripts/put-upload.js "$url" "$file" "$mime"; then
    echo "Uploaded $filename -> $key (via node PUT)"
  else
    echo "Node upload failed; falling back to curl PUT (may fail on some macOS setups)"
    # Try an SDK-backed upload (requires R2 credentials in env). This uploads
    # directly to the bucket/key using the AWS S3 SDK and can bypass presigned URL/TLS issues.
    if node ./scripts/put-upload-sdk.js "$R2_BUCKET" "$key" "$file" "$mime"; then
      echo "Uploaded $filename -> $key (via SDK upload)"
    else
      echo "SDK upload failed; falling back to curl PUT (may fail on some macOS setups)"
      curl -sS -X PUT -T "$file" -H "Content-Type: $mime" "$url"
      echo "Uploaded $filename -> $key (via curl PUT)"
    fi
  fi

  # Confirm upload to server so it can insert metadata into DB
  size=$(stat -f%z "$file" || stat -c%s "$file" || echo 0)
  confirm_resp=$(curl -sS -X POST "$BASE_URL/api/uploads/confirm" -H "Content-Type: application/json" -d "{\"key\":\"$key\",\"filename\":\"$filename\",\"size\":$size,\"mime\":\"$mime\",\"publicUrl\":\"$publicUrl\",\"source_path\":\"$file\"}")
  echo "Confirm response: $confirm_resp"
done

echo "All files processed."
