import React from "react";
import HeroContent from "../sub/HeroContent";

const Hero = () => {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <video
        autoPlay
        muted
        loop
        className="rotate-180 absolute top-[-340px] left-0 z-[0] w-full h-full object-cover opacity-60"
      >
        <source src="/blackhole.gif" type="video/gif" />
      </video>
      <HeroContent />
    </div>
  );
};
export default Hero;
