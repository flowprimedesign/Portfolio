#!/usr/bin/env node
const fs = require("fs");
const https = require("https");
const { URL } = require("url");

async function tryFetchUpload(url, filePath, contentType) {
  const stream = fs.createReadStream(filePath);
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: stream,
      duplex: "half",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} - ${text}`);
    }
    console.log("Upload succeeded (fetch):", filePath);
    return true;
  } catch (err) {
    console.error("Fetch upload failed:", err && err.stack ? err.stack : err);
    return false;
  }
}

function httpsUpload(urlStr, filePath, contentType) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const stat = fs.statSync(filePath);
    const opts = {
      method: "PUT",
      hostname: url.hostname,
      path: url.pathname + (url.search || ""),
      port: url.port || 443,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size,
      },
      // Prefer TLS 1.2+ and request HTTP/1.1 in ALPN to avoid HTTP/2-related handshakes
      minVersion: "TLSv1.2",
      // Request explicit ALPN protocol selection for some servers/clients
      ALPNProtocols: ["http/1.1"],
      // Explicitly set servername (SNI) - some TLS servers require SNI matching
      servername: url.hostname,
    };

    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString();
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          console.log("Upload succeeded (https):", filePath);
          resolve(true);
        } else {
          reject(new Error(`HTTP ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on("error", (err) => reject(err));

    // Additional TLS diagnostics: if socket emits 'secureConnect' we can log negotiated cipher
    req.on("socket", (socket) => {
      socket.on("secureConnect", () => {
        try {
          const proto = socket.getProtocol && socket.getProtocol();
          const cipher = socket.getCipher && socket.getCipher();
          console.error("secureConnect proto:", proto, "cipher:", cipher);
        } catch (e) {
          // ignore
        }
      });
      socket.on("error", (sErr) => {
        console.error("socket error:", sErr && sErr.stack ? sErr.stack : sErr);
      });
    });

    // Log request options (without sensitive query) to help debug TLS/handshake issues
    try {
      const safeOpts = Object.assign({}, opts);
      safeOpts.headers = Object.assign({}, safeOpts.headers);
      console.error("httpsUpload opts:", {
        hostname: safeOpts.hostname,
        port: safeOpts.port,
        path: safeOpts.path,
        minVersion: safeOpts.minVersion,
        ALPNProtocols: safeOpts.ALPNProtocols,
        headers: Object.keys(safeOpts.headers),
      });
    } catch (e) {
      // ignore
    }

    const rs = fs.createReadStream(filePath);
    rs.on("error", (err) => reject(err));
    rs.pipe(req);
  });
}

async function main() {
  const [, , url, filePath, contentType = "application/octet-stream"] =
    process.argv;
  if (!url || !filePath) {
    console.error("Usage: node put-upload.js <url> <filePath> <contentType>");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(2);
  }

  // First try fetch-based upload
  const ok = await tryFetchUpload(url, filePath, contentType);
  if (ok) return process.exit(0);

  // Fallback to https.request
  try {
    await httpsUpload(url, filePath, contentType);
    return process.exit(0);
  } catch (err) {
    console.error("HTTPS upload failed:", err && err.stack ? err.stack : err);
    return process.exit(4);
  }
}

main();
