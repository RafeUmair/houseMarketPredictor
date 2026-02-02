import { useState } from "react";
import { Navbar } from "../components/NavBar";
import { GridBackground } from "../components/GridBackground";
import { HomeSection } from "../components/HomeSection";
import { ValuationSection } from "../components/ValuationSection";
import { SuburbStats } from "../components/SuburbStats";
import { InteractiveMap } from "../components/InteractiveMap";

export const Home = () => {
  const [valuationSuburb, setValuationSuburb] = useState(null);
  const [mapSelectedSuburb, setMapSelectedSuburb] = useState(null);

  const handleSuburbSelect = (suburb) => {
    setMapSelectedSuburb(suburb);
  };

  // Use either valuation suburb or map-selected suburb for stats
  const activeSuburb = valuationSuburb || mapSelectedSuburb;

  return (
    <GridBackground className="min-h-screen">
      <Navbar />
      <HomeSection />
      <ValuationSection onValuationComplete={setValuationSuburb} />
      <InteractiveMap
        onSuburbSelect={handleSuburbSelect}
        selectedSuburb={activeSuburb}
      />
      <SuburbStats triggeredSuburb={activeSuburb} />
    </GridBackground>
  );
};