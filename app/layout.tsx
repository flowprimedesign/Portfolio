import Navbar from "../components/main/Navbar";
import dynamic from "next/dynamic";
const StarsCanvas = dynamic(() => import("../components/main/StarBackground"), {
  ssr: false,
});
import type { Metadata } from "next";
import Footer from "../components/main/Footer";
import { Inter } from "next/font/google";
import "./globals.css";
import Projects from "../components/main/Projects";
import Skills from "../components/main/Skills";
import Hero from "../components/main/Hero";
import Github from "../components/main/Github";
const Contact = dynamic(() => import("../components/main/Contact"), {
  ssr: false,
});
import BackendProjects from "../components/main/BackendProjects";
import AiProjects from "../components/main/AiProjects";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Luis Ibarra - FullStack Dev",
  description: "This is my portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-[#030014] overflow-y-scroll overflow-x-hidden`}
      >
        <StarsCanvas />
        <Navbar />

        <Hero />
        <Github />
        {/* <Projects />
        <BackendProjects /> */}
        <AiProjects />
        <Skills />
        {/* {children} */}
        <Contact />

        <Footer />
      </body>
    </html>
  );
}
