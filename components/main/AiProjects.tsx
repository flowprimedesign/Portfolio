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
            "https://raw.githubusercontent.com/flowprimedesign/CIS25/main/final/demo.gif",
          ]}
        />
        <AiProjectCard
          src="/SpaceWebsite.png"
          title="Gemini AI Integration"
          description="Input some ingredients, get a unique recipe from Gemini AI."
          images={[
            "https://raw.githubusercontent.com/group33capstone/plateit/main/walkthrough.gif",
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
