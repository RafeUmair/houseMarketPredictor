import React, { useState } from "react";
import { Navbar } from "../components/NavBar";
import { GridBackground } from "../components/GridBackground";
import { HomeSection } from "../components/HomeSection";
import { ValuationSection } from "../components/ValuationSection";
import { SuburbStats } from "../components/SuburbStats";

export const Home = () => {
  const [valuationSuburb, setValuationSuburb] = useState(null);

  return (
    <GridBackground className="min-h-screen">
      <Navbar />
      <HomeSection />
      <ValuationSection onValuationComplete={setValuationSuburb} />
      <SuburbStats triggeredSuburb={valuationSuburb} />
    </GridBackground>
  );
};