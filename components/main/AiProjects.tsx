import React from "react";
import AiProjectCard from "../sub/AiProjectCard";
import Link from "next/link";

const AiProjects = () => {
  return (
    <div
      className="flex flex-col items-center justify-center py-20"
      id="projects"
    >
      <h1 className="text-[40px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 py-20">
        AI Projects
      </h1>
      <div className="h-full w-full flex flex-col md:flex-row gap-10 px-10">
        <AiProjectCard
          src="/CardImage.png"
          title="Computer Vision"
          description="Pokemon style AR filter. Wear all the masks."
          images={[
            "/pokemesh.gif",
            "/pokemesh1.png",
            "/pokemesh2.png",
            "/pokemesh3.png",
          ]}
        />
        <AiProjectCard
          src="/SpaceWebsite.png"
          title="Gemini AI Integration"
          description="Such as the site you are on right now"
          images={[
            "/plateit.gif",
            "/plateit1.png",
            "/plateit2.png",
            "/plateit3.png",
          ]}
        />
        {/* <AiProjectCard
          src="/shopping-cart.png"
          title="Interactive Applications"
          description="A shopping cart helper: helps you stick to your budget, and save time at checkout."
          images={[
            "/shopping-cart.png",
            "/shopping-cart.png",
            "/shopping-cart.png",
            "/shopping-cart.png",
          ]}
        /> */}
      </div>
    </div>
  );
};

export default AiProjects;
