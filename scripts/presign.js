const fs = require('fs');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const envRaw = fs.readFileSync('.env','utf8');
const env = {};
envRaw.split(/\n/).forEach(line=>{ if(!line||line.trim().startsWith('#')) return; const idx=line.indexOf('='); if(idx===-1) return; const k=line.slice(0,idx).trim(); let v=line.slice(idx+1).trim(); if(v.startsWith('"')&&v.endsWith('"')) v=v.slice(1,-1); env[k]=v; });
const R2_ENDPOINT = env.R2_ENDPOINT; const R2_BUCKET = env.R2_BUCKET; const ACCESS_KEY = env.R2_ACCESS_KEY_ID; const SECRET = env.R2_SECRET_ACCESS_KEY;
if(!R2_ENDPOINT||!R2_BUCKET||!ACCESS_KEY||!SECRET){ console.error('Missing R2 env vars'); process.exit(2); }
const client = new S3Client({ region:'auto', endpoint: R2_ENDPOINT.replace(/\/+$/,''), credentials:{ accessKeyId:ACCESS_KEY, secretAccessKey:SECRET }, forcePathStyle:true });
(async()=>{
  try{
    const key = process.argv[2];
    if(!key){ console.error('Usage: node scripts/presign.js <key>'); process.exit(1); }
    const cmd = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key });
    const url = await getSignedUrl(client, cmd, { expiresIn: 3600 });
    console.log(url);
  }catch(e){ console.error(e&&e.stack?e.stack:e); process.exit(3); }
})();
