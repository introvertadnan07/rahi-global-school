
import { useState } from "react";
import {
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const links = [
  ["About", "/about"],
  ["Academics", "/academics"],
  ["Campus", "/campus"],
  ["Student Life", "/student-life"],
  ["Gallery", "/gallery"],
  ["Contact", "/contact"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="container-x flex h-20 items-center justify-between gap-4">
        {/* School Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-3"
        >
          <img
            src="/logo.jpg"
            alt="Rahi Global School"
            className="h-12 w-12 object-contain"
          />

          <div>
            <div className="text-lg font-black tracking-tight text-navy">
              RAHI GLOBAL
            </div>
            <div className="mt-1 text-[10px] font-extrabold tracking-[0.28em] text-sky">
              SCHOOL
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 xl:gap-6 lg:flex">
          {links.map(([label, path]) => (
            <Link
              key={path}
              to={path}
              className={`whitespace-nowrap text-sm font-bold transition ${
                location.pathname === path
                  ? "text-sky"
                  : "text-slate-600 hover:text-sky"
              }`}
            >
              {label}
            </Link>
          ))}

          {/* Admin Login — TOP NAVBAR */}
          <Link
            to="/admin/login"
            aria-label="Admin Login"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-navy transition hover:border-navy hover:bg-slate-50"
          >
            <ShieldCheck size={17} />
            <span>Admin Login</span>
          </Link>

          {/* Admissions */}
          <Link
            to="/admissions"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-yellow px-4 py-3 text-sm font-extrabold text-navy transition hover:bg-yellow/90 xl:px-5"
          >
            Admissions
            <ChevronRight size={16} />
          </Link>
        </nav>

        {/* Mobile Header */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/admin/login"
            onClick={closeMenu}
            aria-label="Admin Login"
            title="Admin Login"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-navy transition hover:bg-slate-50"
          >
            <ShieldCheck size={19} />
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-navy transition hover:bg-slate-100"
          >
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-5 py-5 shadow-lg lg:hidden">
          <nav>
            {links.map(([label, path]) => (
              <Link
                key={path}
                to={path}
                onClick={closeMenu}
                className={`block rounded-lg px-4 py-3 font-bold transition hover:bg-slate-50 ${
                  location.pathname === path
                    ? "text-sky"
                    : "text-navy hover:text-sky"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
            <Link
              to="/admin/login"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-navy transition hover:bg-slate-50"
            >
              <ShieldCheck size={17} />
              Admin Login
            </Link>

            <Link
              to="/admissions"
              onClick={closeMenu}
              className="flex items-center justify-center gap-1 rounded-xl bg-yellow px-3 py-3 text-sm font-extrabold text-navy transition hover:bg-yellow/90"
            >
              Admissions
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
