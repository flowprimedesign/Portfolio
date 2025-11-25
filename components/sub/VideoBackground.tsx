"use client";

import React from "react";
import usePublicImage from "./usePublicImage";

export default function VideoBackground() {
  const { url } = usePublicImage("cards-video.webm");
  // Prefer DB URL, but fall back to local `public/cards-video.webm` so background shows.
  const src = url || "/cards-video.webm";

  return (
    <video
      className="w-full h-auto"
      preload="false"
      playsInline
      loop
      muted
      autoPlay
      crossOrigin="anonymous"
      src={src}
    />
  );
}
