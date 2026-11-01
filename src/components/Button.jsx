import { ArrowRight } from "lucide-react";

export default function Button({
  children,
  to = "#",
  variant = "primary",
}) {
  const buttonStyle =
    variant === "primary"
      ? "bg-navy text-white shadow-soft hover:bg-sky"
      : "bg-yellow text-navy hover:bg-yellow/90";

  return (
    <a
      href={to}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-extrabold transition hover:-translate-y-0.5 ${buttonStyle}`}
    >
      <span>{children}</span>

      <ArrowRight size={18} />
    </a>
  );
}