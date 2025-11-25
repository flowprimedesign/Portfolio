"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import usePublicImage from "./usePublicImage";

interface Props {
  src: string;
  width: number;
  height: number;
  index: number;
}

const SkillDataProvider = ({ src = "", width, height, index }: Props) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });

  const imageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const animationDelay = 0.3;
  const { url: resolved } = usePublicImage(src);
  const imgSrc = resolved || `/${src.replace(/^\/+/, "")}`;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      variants={imageVariants}
      animate={inView ? "visible" : "hidden"}
      custom={index}
      transition={{ delay: index * animationDelay }}
    >
      {/* render resolved DB URL or fall back to local public asset */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgSrc} width={width} height={height} alt="skill image" />
    </motion.div>
  );
};

export default SkillDataProvider;
