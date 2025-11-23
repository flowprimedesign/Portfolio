"use client";

import Image from "next/image";
import React, { useState } from "react";

interface Props {
  src: string;
  title: string;
  description: string;
  images?: string[]; // optional explicit gallery images
}

function deriveGallery(src: string) {
  // Try to derive 4 images from base src: /name.ext -> /name-1.ext ... -4
  const m = src.match(/^(.*)\.(png|jpe?g|webp|gif|svg)$/i);
  if (!m) return [src, src, src, src];
  const base = m[1];
  const ext = m[2];
  return [1, 2, 3, 4].map((n) => `${base}-${n}.${ext}`);
}

const AiProjectCard = ({ src, title, description, images }: Props) => {
  const [hovered, setHovered] = useState(false);
  const gallery =
    images && images.length > 0 ? images.slice(0, 4) : deriveGallery(src);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const prev = () => setIndex((i) => (i - 1 + gallery.length) % gallery.length);
  const next = () => setIndex((i) => (i + 1) % gallery.length);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? "scale(1.03)" : "scale(1)",
        zIndex: hovered ? 20 : "auto",
      }}
      className="relative overflow-hidden rounded-lg shadow-lg border border-[#2A0E61] transition-transform duration-300 hover:shadow-2xl hover:border-4 hover:border-purple-400 bg-[#040217]"
    >
      {/* Main image area */}
      <div
        className="w-full h-48 md:h-60 lg:h-72 bg-black flex items-center justify-center cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Image
          src={gallery[index]}
          alt={`${title} ${index + 1}`}
          width={1200}
          height={800}
          className="max-h-full object-contain"
        />
      </div>

      {/* Thumbnails */}
      <div className="p-3 flex gap-2 items-center justify-center">
        {gallery.map((g, i) => (
          <button
            key={g}
            onClick={() => setIndex(i)}
            aria-label={`Show image ${i + 1}`}
            className={`w-16 h-12 rounded overflow-hidden border ${
              i === index ? "ring-2 ring-purple-400" : ""
            }`}
          >
            <Image
              src={g}
              alt={`${title} thumb ${i + 1}`}
              width={160}
              height={120}
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>

      <div className="relative p-4">
        <h1 className="py-2 button-primary text-center text-white cursor-default rounded-lg max-w-[200px] text-2xl font-semibold">
          {title}
        </h1>
        <p className="mt-2 text-gray-300">{description}</p>
      </div>

      {/* Simple modal/lightbox */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 text-white text-2xl"
          >
            ✕
          </button>
          <button
            onClick={prev}
            className="absolute left-6 text-white text-3xl"
          >
            ◀
          </button>
          <div className="max-w-5xl max-h-[80vh] w-full mx-6">
            <Image
              src={gallery[index]}
              alt={`${title} large ${index + 1}`}
              width={2400}
              height={1600}
              className="w-full h-auto object-contain"
            />
          </div>
          <button
            onClick={next}
            className="absolute right-6 text-white text-3xl"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default AiProjectCard;
