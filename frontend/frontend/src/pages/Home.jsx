import React from "react";
import { Navbar } from "../components/NavBar";
import { GridBackground } from "../components/GridBackground";
import { HomeSection } from "../components/HomeSection";

export const Home = () => {
  return (
    <GridBackground className="min-h-screen flex items-center justify-center">
      <Navbar />
      <HomeSection />
    </GridBackground>
  );
};