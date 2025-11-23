import React from "react";
import HeroContent from "../sub/HeroContent";

const Hero = () => {
  return (
    <div className="relative flex flex-col min-h-[70vh] w-full">
      <img
        src="https://raw.githubusercontent.com/flowprimedesign/Portfolio/main/public/blackhole.gif"
        alt="Animated blackhole background"
        className="rotate-180 absolute left-0 -top-40 md:-top-60 z-[0] w-full h-full object-cover opacity-60"
      />
      <HeroContent />
    </div>
  );
};
export default Hero;
