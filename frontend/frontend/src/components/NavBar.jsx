import { Link } from "react-router-dom";
import houseLogo from "@/assets/houseLogo.png";
import { DarkModeToggle } from "./DarkModeToggle";

export const Navbar = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background border-b">
      <div className="container h-14 flex items-center">
        {/* House Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight group"
        >
          <img
            src={houseLogo}
            alt="Houser logo"
            className="h-10 w-10 object-contain border-0"
          />
          <span className="text-primary">
            Houser
          </span>
        </Link>

        {/*Central Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-foreground flex-1 justify-center">
          <a href="#home" className="hover:text-primary transition">
            Home
          </a>
          <a href="#about" className="hover:text-primary transition">
            About
          </a>
          <a href="#valuation" className="hover:text-primary transition">
            Valuation
          </a>
        </nav>

        {/* DarkMode Toggle*/}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <DarkModeToggle />
        </div>
      </div>
    </header>
  );
};
