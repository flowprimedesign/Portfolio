const fs = require('fs');
const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
const envRaw = fs.readFileSync('.env','utf8');
const env = {};
envRaw.split(/\n/).forEach(line=>{ if(!line||line.trim().startsWith('#')) return; const idx=line.indexOf('='); if(idx===-1) return; const k=line.slice(0,idx).trim(); let v=line.slice(idx+1).trim(); if(v.startsWith('"')&&v.endsWith('"')) v=v.slice(1,-1); env[k]=v; });
const client = new S3Client({ region:'auto', endpoint: env.R2_ENDPOINT.replace(/\/+$/,''), credentials:{ accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY }, forcePathStyle:true });
(async()=>{
  try{
    const key = process.argv[2];
    if(!key){ console.error('Usage: node scripts/head-r2.js <key>'); process.exit(1); }
    const res = await client.send(new HeadObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
    console.log('Head OK:', res);
  }catch(e){ console.error('Head failed:', e && e.stack ? e.stack : e); process.exit(2); }
})();
