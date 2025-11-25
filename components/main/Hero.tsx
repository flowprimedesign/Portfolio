"use client";
import React from "react";
import HeroContent from "../sub/HeroContent";
import usePublicImage from "../sub/usePublicImage";

const Hero = () => {
  // Try both webm and gif DB rows (some migrations stored one or the other).
  const { url: webmUrl } = usePublicImage("blackhole.webm");
  const { url: gifUrl } = usePublicImage("blackhole.gif");
  // Prefer DB URL, but fall back to local `public/` assets so things keep working.
  const backSrc = webmUrl || gifUrl || "/blackhole.webm";

  return (
    <div className="relative flex flex-col min-h-[70vh] w-full">
      {/* prefer DB-hosted gif, fall back to local file */}
      {/* Render .webm as looping video, otherwise use an img for gifs/local */}
      {backSrc && backSrc.endsWith(".webm") ? (
        <video
          src={backSrc}
          autoPlay
          loop
          muted
          playsInline
          crossOrigin="anonymous"
          className="rotate-180 absolute left-0 -top-40 md:-top-60 z-[0] w-full h-full object-cover opacity-60"
        />
      ) : backSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backSrc}
          alt="Animated blackhole background"
          crossOrigin="anonymous"
          className="rotate-180 absolute left-0 -top-40 md:-top-60 z-[0] w-full h-full object-cover opacity-60"
        />
      ) : null}
      <HeroContent />
    </div>
  );
};
export default Hero;
