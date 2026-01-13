import React from "react";

export const GridBackground = ({ children, className = "" }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>

      {/* Minimalist gradient background (light)*/}
      <div 
        className="absolute inset-0 pointer-events-none z-0 dark:hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, hsl(217 91% 60% / 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, hsl(217 91% 60% / 0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, hsl(217 91% 60% / 0.02) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Minimalist gradient background (dark)*/}
      <div 
        className="absolute inset-0 pointer-events-none z-0 hidden dark:block"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, hsl(217 91% 60% / 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, hsl(217 91% 60% / 0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, hsl(217 91% 60% / 0.05) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Grid pattern (light)*/}
      <div 
        className="absolute inset-0 pointer-events-none z-0 dark:hidden"
        style={{
          backgroundImage: `
            linear-gradient(hsl(217 91% 60% / 0.02) 1px, transparent 1px),
            linear-gradient(90deg, hsl(217 91% 60% / 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Grid pattern (dark)*/}
      <div 
        className="absolute inset-0 pointer-events-none z-0 hidden dark:block"
        style={{
          backgroundImage: `
            linear-gradient(hsl(217 91% 60% / 0.05) 1px, transparent 1px),
            linear-gradient(90deg, hsl(217 91% 60% / 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

