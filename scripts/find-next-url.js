#!/usr/bin/env node
const fetch = globalThis.fetch || require("node-fetch");
(async () => {
  const ports = Array.from({ length: 11 }, (_, i) => 3000 + i);
  for (const p of ports) {
    const url = `http://localhost:${p}`;
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.status === 200) {
        console.log(url);
        process.exit(0);
      }
    } catch (e) {
      // ignore
    }
  }
  // fallback
  console.log("http://localhost:3000");
  process.exit(0);
})();
