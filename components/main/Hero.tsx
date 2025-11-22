import React from "react";
import HeroContent from "../sub/HeroContent";
import StarsCanvas from "./StarBackground";

const Hero = () => {
  return (
    <div className="relative flex flex-col h-screen w-full">
      <StarsCanvas />
      <video
        autoPlay
        muted
        loop
        className="rotate-180 absolute top-[-340px] left-0 z-[0] w-full h-full object-cover"
      >
        <source src="/blackhole.webm" type="video/webm" />
      </video>
      <HeroContent />
    </div>
  );
};
export default Hero;
