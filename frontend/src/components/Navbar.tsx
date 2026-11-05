import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";

interface NavbarProps {
  dark: boolean;
  setDark: (v: boolean) => void;
}

export default function Navbar({ dark, setDark }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/predict", label: "Predict" },
    { to: "/history", label: "History" },
    { to: "/about", label: "About" },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "text-[#0077B6] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#0077B6] after:rounded-full"
        : "text-gray-600 dark:text-gray-300 hover:text-[#0077B6] dark:hover:text-[#0077B6]"
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 text-sm font-medium transition-colors duration-200 border-l-4 ${
      isActive
        ? "text-[#0077B6] border-[#0077B6] bg-blue-50 dark:bg-blue-950/30"
        : "text-gray-600 dark:text-gray-300 border-transparent hover:text-[#0077B6] hover:border-[#0077B6]/40 hover:bg-gray-50 dark:hover:bg-gray-800"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              {/* Bone shape */}
              <circle cx="8" cy="8" r="5" fill="#0077B6" opacity="0.85" />
              <circle cx="24" cy="8" r="5" fill="#0077B6" opacity="0.85" />
              <circle cx="8" cy="24" r="5" fill="#0077B6" opacity="0.85" />
              <circle cx="24" cy="24" r="5" fill="#0077B6" opacity="0.85" />
              <rect x="12" y="6" width="8" height="4" rx="2" fill="#0077B6" opacity="0.9" />
              <rect x="12" y="22" width="8" height="4" rx="2" fill="#0077B6" opacity="0.9" />
              <rect x="13" y="10" width="6" height="12" rx="3" fill="#0077B6" />
            </svg>
            <span className="text-xl font-bold text-[#0077B6] tracking-tight">
              OsteoNet AI
            </span>
          </NavLink>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === "/"}>
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Right side: dark toggle + mobile menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-72 border-t border-gray-100 dark:border-gray-800" : "max-h-0"
        }`}
      >
        <div className="py-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={mobileLinkClass}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
