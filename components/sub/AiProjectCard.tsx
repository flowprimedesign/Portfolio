"use client";

import React, { useState } from "react";

interface Props {
  src: string;
  title: string;
  description: string;
  images?: string[]; // optional explicit image URL(s)
}

const AiProjectCard = ({ src, title, description, images }: Props) => {
  const [hovered, setHovered] = useState(false);
  const image = images && images.length > 0 ? images[0] : src;

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
      {/* Main image area (single image) */}
      <div className="w-full h-48 md:h-60 lg:h-72 bg-black flex items-center justify-center">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="max-h-full object-contain"
        />
      </div>

      <div className="relative p-4">
        <h1 className="py-2 text-center text-white cursor-default rounded-lg w-full text-2xl font-semibold">
          {title}
        </h1>
        <p className="mt-2 text-gray-300">{description}</p>
      </div>

      {/* No modal/lightbox: single image only */}
    </div>
  );
};

export default AiProjectCard;
