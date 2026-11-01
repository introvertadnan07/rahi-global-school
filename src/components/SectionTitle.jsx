export default function SectionTitle({
  eyebrow,
  title,
  text,
  center = false,
}) {
  const containerClass = center
    ? "mx-auto max-w-2xl text-center"
    : "max-w-2xl";

  return (
    <div className={containerClass}>
      <span className="mb-3 inline-block rounded-full bg-sky/10 px-4 py-1.5 text-sm font-extrabold text-sky">
        {eyebrow}
      </span>

      <h2 className="text-balance text-3xl font-black leading-tight text-navy md:text-5xl">
        {title}
      </h2>

      {text && (
        <p className="mt-4 text-lg leading-8 text-slate-600">
          {text}
        </p>
      )}
    </div>
  );
}