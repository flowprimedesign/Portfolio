import Navbar from "../components/main/Navbar";
import type { Metadata } from "next";
import Footer from "../components/main/Footer";
import { Inter } from "next/font/google";
import "./globals.css";
import Projects from "../components/main/Projects";
import Skills from "../components/main/Skills";
import Hero from "../components/main/Hero";
import Github from "../components/main/Github";
import Contact from "../components/main/Contact";
import BackendProjects from "../components/main/BackendProjects";
import AiProjects from "../components/main/AiProjects";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FrontEnd Portfolio",
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
        <Navbar />

        <Hero />
        <Github />
        <Projects />
        <BackendProjects />
        <AiProjects />
        <Skills />
        {/* {children} */}
        <Contact />

        <Footer />
      </body>
    </html>
  );
}
