import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ShieldCheck,
  UserRound,
  UserPlus,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getParentToken } from "../lib/parentAuth";

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
  const [isParentLoggedIn, setIsParentLoggedIn] = useState(
    () => Boolean(getParentToken())
  );

  const location = useLocation();

  useEffect(() => {
    setIsParentLoggedIn(Boolean(getParentToken()));
  }, [location.pathname]);

  useEffect(() => {
    const syncSession = () => {
      setIsParentLoggedIn(Boolean(getParentToken()));
    };

    window.addEventListener("parent-auth-changed", syncSession);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener("parent-auth-changed", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const closeMenu = () => setOpen(false);

  const parentLinks = [
    { label: "Parent Login", path: "/parent/login", Icon: UserRound },
    { label: "Parent Register", path: "/parent/register", Icon: UserPlus },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="container-x flex h-20 items-center justify-between gap-4">
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
        <nav className="ml-2 hidden items-center gap-4 lg:flex xl:ml-4 xl:gap-5">
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

          {isParentLoggedIn ? (
            <Link
              to="/parent/dashboard"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-bold text-sky-900 hover:bg-sky-100"
            >
              <UserRound size={16} />
              Parent Dashboard
            </Link>
          ) : (
            parentLinks.map(({ label, path, Icon }) => (
              <Link
                key={path}
                to={path}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 px-3 py-2 text-sm font-bold text-navy hover:border-sky hover:bg-sky-50"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))
          )}

          <Link
            to="/admissions"
            className="shrink-0 whitespace-nowrap rounded-full bg-yellow px-5 py-3 text-sm font-extrabold text-navy transition hover:bg-yellow/90"
          >
            Admissions
          </Link>
        </nav>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 lg:hidden">
          {isParentLoggedIn ? (
            <Link
              to="/parent/dashboard"
              onClick={closeMenu}
              aria-label="Parent Dashboard"
              title="Parent Dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-900"
            >
              <UserRound size={19} />
            </Link>
          ) : (
            <Link
              to="/parent/login"
              onClick={closeMenu}
              aria-label="Parent Login"
              title="Parent Login"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-navy hover:bg-sky-50"
            >
              <UserRound size={19} />
            </Link>
          )}

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="rounded-lg p-2 text-navy hover:bg-slate-100"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-5 py-5 shadow-lg lg:hidden">
          {links.map(([label, path]) => (
            <Link
              key={path}
              to={path}
              onClick={closeMenu}
              className="block py-3 font-bold text-navy hover:text-sky"
            >
              {label}
            </Link>
          ))}

          {isParentLoggedIn ? (
            <Link
              to="/parent/dashboard"
              onClick={closeMenu}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 font-bold text-sky-900"
            >
              <UserRound size={18} />
              Parent Dashboard
            </Link>
          ) : (
            parentLinks.map(({ label, path, Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={closeMenu}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 font-bold text-sky-900"
              >
                <Icon size={18} />
                {label}
              </Link>
            ))
          )}

          <Link
            to="/admissions"
            onClick={closeMenu}
            className="mt-3 block rounded-full bg-yellow px-5 py-3 text-center font-extrabold text-navy hover:bg-yellow/90"
          >
            Admissions
          </Link>
        </div>
      )}
    </header>
  );
}


