import { Link } from "react-router-dom";
import houseLogo from "@/assets/houseLogo.png";

export const Navbar = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background border-b">
      <div className="container h-14 flex items-center justify-between">

        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
        >
          <img
            src={houseLogo}
            alt="Houser logo"
            className="h-10 w-10 object-contain border-0"
          />
          <span>Houser</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-foreground">
          <a href="#home" className="hover:text-primary transition">
            Home
          </a>
          <a href="#about" className="hover:text-primary transition">
            About
          </a>
        </nav>
      </div>
    </header>
  );
};
