"use client";

import { useEffect, useState } from "react";

// Keep caches in a global (window) object in development so HMR/fast-refresh
// doesn't clear them and cause repeated fetches.
const globalKey = "__PUBLIC_IMAGE_HOOK__";
function getGlobalMaps() {
  if (typeof window === "undefined") {
    return {
      cache: new Map<string, string | null>(),
      negativeExpiry: new Map<string, number>(),
      inFlight: new Map<string, Promise<string | null>>(),
    };
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!window[globalKey]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window[globalKey] = {
      cache: new Map<string, string | null>(),
      negativeExpiry: new Map<string, number>(),
      inFlight: new Map<string, Promise<string | null>>(),
    };
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return window[globalKey] as {
    cache: Map<string, string | null>;
    negativeExpiry: Map<string, number>;
    inFlight: Map<string, Promise<string | null>>;
  };
}

const { cache, negativeExpiry, inFlight } = getGlobalMaps();

export default function usePublicImage(filenameOrPath?: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filenameOrPath) return;

    // If already an absolute URL, return it directly
    if (/^https?:\/\//i.test(filenameOrPath)) {
      setUrl(filenameOrPath);
      return;
    }

    // Normalize: strip leading slashes
    const filename = filenameOrPath.replace(/^\/+/, "");

    // Default behavior: use local `public/` assets unless explicitly enabled.
    // Set `NEXT_PUBLIC_USE_DB_IMAGES=true` to restore DB lookups.
    if (process.env.NEXT_PUBLIC_USE_DB_IMAGES !== "true") {
      // Normalize and return the local public path immediately to avoid any network calls
      setUrl(`/${filename}`);
      return;
    }

    // If we have a cached positive value, use it immediately to avoid flicker
    if (cache.has(filename)) {
      const cached = cache.get(filename);
      if (cached) setUrl(cached);
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.debug(`[usePublicImage] cache hit for ${filename}:`, cached);
      }
      // If we cached a null previously, consult negative expiry to decide whether to re-fetch
      if (cached === null) {
        const exp = negativeExpiry.get(filename) || 0;
        if (Date.now() < exp) return; // still in negative cache window
        // stale negative cache: fall through to re-fetch
      } else {
        return;
      }
    }

    let cancelled = false;
    async function fetchUrl() {
      setLoading(true);
      try {
        // If another render has already started the same fetch, reuse it
        if (inFlight.has(filename)) {
          const shared = await inFlight.get(filename);
          if (cancelled) return;
          if (shared) setUrl(shared);
          return;
        }

        const p = (async () => {
          const res = await fetch(
            `/api/uploads/get?filename=${encodeURIComponent(filename)}`
          );
          if (!res.ok) return null;
          const body = await res.json();
          const row = body?.row;
          return row?.url || null;
        })();

        inFlight.set(filename, p);
        const found = await p;
        inFlight.delete(filename);
        if (cancelled) return;

        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.debug(`[usePublicImage] fetched ${filename}:`, found);
        }

        if (found) {
          cache.set(filename, found);
          setUrl(found);
          negativeExpiry.delete(filename);
        } else {
          // short negative cache to avoid repeated 404s while developer iterates
          cache.set(filename, null);
          negativeExpiry.set(filename, Date.now() + 30_000); // 30s
        }
      } catch (e) {
        // on error, leave existing url alone (avoid flicker)
      } finally {
        inFlight.delete(filename);
        if (!cancelled) setLoading(false);
      }
    }

    fetchUrl();
    return () => {
      cancelled = true;
    };
  }, [filenameOrPath]);

  return { url, loading };
}
