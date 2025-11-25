"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import usePublicImage from "./usePublicImage";

const ContactCard = () => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const setVars = useCallback((el: HTMLDivElement, px: number, py: number) => {
    // px,py are normalized 0..1 within element
    const rx = (0.5 - py) * 10; // rotateX (tilt up/down)
    const ry = (px - 0.5) * 10; // rotateY (tilt left/right)
    const tx = (px - 0.5) * 8; // translate x in px
    const ty = (py - 0.5) * 6; // translate y in px
    const hyp = Math.hypot(px - 0.5, py - 0.5);

    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--posx", `${px * 100}%`);
    el.style.setProperty("--posy", `${py * 100}%`);
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--tx", `${tx}px`);
    el.style.setProperty("--ty", `${ty}px`);
    el.style.setProperty("--hyp", `${hyp}`);
    el.style.setProperty("--s", `1.02`);
  }, []);

  const resetVars = useCallback((el: HTMLDivElement) => {
    el.style.setProperty("--mx", `50%`);
    el.style.setProperty("--my", `50%`);
    el.style.setProperty("--posx", `50%`);
    el.style.setProperty("--posy", `50%`);
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
    el.style.setProperty("--tx", `0px`);
    el.style.setProperty("--ty", `0px`);
    el.style.setProperty("--hyp", `0`);
    el.style.setProperty("--s", `1`);
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    // initialize
    resetVars(el as HTMLDivElement);

    const onPointerMove = (e: PointerEvent) => {
      if (!cardRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const rect = cardRef.current.getBoundingClientRect();
      const px = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const py = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
      rafRef.current = requestAnimationFrame(() =>
        setVars(cardRef.current as HTMLDivElement, px, py)
      );
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (!cardRef.current) return;
      // small scale up when interacting
      cardRef.current.style.setProperty("--s", "1.02");
    };

    const onPointerLeave = (e: PointerEvent) => {
      if (!cardRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resetVars(cardRef.current as HTMLDivElement);
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerenter", onPointerEnter);
    el.addEventListener("pointerleave", onPointerLeave);

    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerenter", onPointerEnter);
      el.removeEventListener("pointerleave", onPointerLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [resetVars, setVars]);

  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Read endpoint from env (set NEXT_PUBLIC_FORMSPREE_ENDPOINT) or use provided Formspree endpoint
    const endpoint =
      process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ||
      "https://formspree.io/f/mqajbjjr";

    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        // flip to back face only after successful send
        setFlipped(true);
      } else {
        const txt = await res.text();
        setError(`Send failed: ${res.status} ${txt}`);
      }
    } catch (err) {
      setError("Network error while sending message");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    // flip back to front
    setFlipped(false);
  };

  // Try both webm and gif DB rows (some migrations stored one or the other).
  const { url: webmUrl } = usePublicImage("blackhole.webm");
  const { url: gifUrl } = usePublicImage("blackhole.gif");
  // Prefer DB-hosted URL, but fall back to local `public/` assets so the card still renders.
  const backSrc = webmUrl || gifUrl || "/blackhole.webm";

  return (
    <div className="contact-card-wrapper py-6">
      <div
        className={"card" + (flipped ? " flipped" : "")}
        data-flipped={flipped}
        ref={cardRef}
        // keep a small default tilt; interactive handlers will override
        style={{
          ["--rx" as any]: "3deg",
          ["--ry" as any]: "-4deg",
          ["--s" as any]: "1",
        }}
      >
        <div className="card__translater">
          <div className="card__rotator">
            <div className="card__front card__content max-w-xl mx-auto p-6 rounded-lg border border-[#2A0E61]">
              <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-semibold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-400">
                  Contact Me
                </h2>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    name="name"
                    className="w-full px-4 py-2 text-sm text-white placeholder-gray-400 bg-transparent border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow duration-350"
                  />
                </div>

                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    className="w-full px-4 py-2 text-sm text-white placeholder-gray-400 bg-transparent border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow duration-150"
                  />
                </div>

                <div className="mb-4">
                  <textarea
                    placeholder="Your message"
                    name="message"
                    rows={5}
                    className="w-full px-4 py-2 text-sm text-white placeholder-gray-400 bg-transparent border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow duration-150"
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-semibold text-white uppercase transition-all duration-200 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-400 rounded-md shadow-md hover:shadow-lg"
                  >
                    Send message
                  </button>
                </div>
              </form>
            </div>

            {/* shine layer */}
            <div className="card__shine" aria-hidden="true"></div>

            {/* back face */}
            <div
              className="card__back"
              onClick={handleBackClick}
              role="button"
              tabIndex={0}
              aria-hidden={!flipped}
            >
              {/* Render a looping video for .webm, otherwise render the image for gifs */}
              {backSrc ? (
                backSrc.endsWith(".webm") ? (
                  <video
                    src={backSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const v = e.currentTarget as HTMLVideoElement;
                      // fall back to gif if webm fails and gif exists
                      if (gifUrl) v.src = gifUrl;
                    }}
                    className="back-video object-cover w-full h-full"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={backSrc}
                    alt="Blackhole animation"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      // if DB gif fails, no local fallback (keep DB-only behavior)
                      img.style.display = "none";
                    }}
                    className="back-video object-cover w-full h-full"
                  />
                )
              ) : null}
              <div className="back-overlay">
                <h3 className="text-2xl font-semibold text-purple-400">
                  Message Sent!
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
