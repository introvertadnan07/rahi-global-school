
export default function SchoolCard({ title, text, image }) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_12px_35px_rgba(16,31,66,0.07)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(16,31,66,0.13)]">
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-slate-100 sm:h-64">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101f42]/25 via-transparent to-transparent" />
        <span className="absolute bottom-4 left-4 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-bold tracking-wide text-[#101f42] shadow-sm">
          Rahi Global School
        </span>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-7">
        <div className="mb-3 h-1 w-10 rounded-full bg-[#e5c04b] transition-all duration-300 group-hover:w-16" />

        <h3 className="text-xl font-extrabold tracking-tight text-[#142b52] sm:text-2xl">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          {text}
        </p>
      </div>
    </article>
  );
}
