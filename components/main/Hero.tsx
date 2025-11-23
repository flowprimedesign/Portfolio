import React from "react";
import HeroContent from "../sub/HeroContent";

const Hero = () => {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <img
        src="/blackhole.gif"
        alt="Animated blackhole background"
        className="rotate-180 absolute -top-40 md:-top-80 left-0 z-[0] w-full h-full object-cover opacity-60"
      />
      <HeroContent />
    </div>
  );
};
export default Hero;
