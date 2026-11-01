export default function FacilityCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky/10 text-sky">
        <Icon size={24} />
      </div>

      <h3 className="text-lg font-black text-navy">
        {title}
      </h3>

      <p className="mt-2 leading-7 text-slate-600">
        {text}
      </p>
    </div>
  );
}