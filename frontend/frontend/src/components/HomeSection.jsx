import React from "react";
import { Link } from "react-router-dom";

export const HomeSection = () => {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-8"
    >
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 fade-up home-title" style={{ animationDelay: '0.1s' }}>
        Track your property's value in real-time
      </h1>
      <p className="text-lg md:text-xl text-foreground/70 mb-12 max-w-2xl fade-up" style={{ animationDelay: '0.3s' }}>
        Houser uses smart data analysis to give you an accurate estimate of your
        property's value in seconds. Fast, secure, reliable, and easy to use.
      </p>
      <Link
        to="#valuation"
        className="themed-button fade-up"
        style={{ animationDelay: '0.5s' }}
      >
        Get Valuation
      </Link>
    </section>
  );
};
