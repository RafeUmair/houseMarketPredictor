import React from "react";
import { Navbar } from "../components/NavBar";
import { GridBackground } from "../components/GridBackground";

export const Home = () => {
  return (
    <GridBackground className="min-h-screen flex items-center justify-center">
      <Navbar />
      <h1 className="text-2xl font-bold">Home</h1>
    </GridBackground>
  );
};