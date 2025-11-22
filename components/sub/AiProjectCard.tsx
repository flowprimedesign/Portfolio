"use client";

import Image from "next/image";
import React, { useState } from "react";

interface Props {
  src: string;
  title: string;
  description: string;
}

const AiProjectCard = ({ src, title, description }: Props) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? "scale(1.05)" : "scale(1)",
        zIndex: hovered ? 20 : "auto",
      }}
      className="relative overflow-hidden rounded-lg shadow-lg border border-[#2A0E61] transition-transform duration-300 hover:shadow-2xl hover:border-4 hover:border-purple-400 group"
    >
      <Image
        src={src}
        alt={title}
        width={1000}
        height={1000}
        className="w-full object-contain transition-transform duration-300 group-hover:scale-105"
      />

      {/* Hover overlay — becomes visible on hover to confirm hover behavior */}
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <span className="text-white text-lg font-semibold">Preview</span>
      </div>

      <div className="relative p-4">
        <h1 className="py-2 button-primary text-center text-white cursor-pointer rounded-lg max-w-[200px] text-2xl font-semibold">
          {title}
        </h1>
        <p className="mt-2 text-gray-300">{description}</p>
      </div>
    </div>
  );
};

export default AiProjectCard;
