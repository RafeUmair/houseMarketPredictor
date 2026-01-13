import React from "react";
import { Navbar } from "../components/NavBar";
import { GridBackground } from "../components/GridBackground";
import { HomeSection } from "../components/HomeSection";
import { ValuationSection } from "../components/ValuationSection";

export const Home = () => {
  return (
    <GridBackground className="min-h-screen">
      <Navbar />
      <HomeSection />
      <ValuationSection />
    </GridBackground>
  );
};