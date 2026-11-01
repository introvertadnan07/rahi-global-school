export default function TestimonialCard({
  name,
  text,
}) {
  return (
    <div className="rounded-3xl bg-[#F5FAFF] p-7">
      <div className="text-4xl text-yellow">
        “
      </div>

      <p className="-mt-2 text-lg leading-8 text-slate-700">
        {text}
      </p>

      <div className="mt-6 font-black text-navy">
        {name}
      </div>

      <div className="text-sm text-slate-500">
        Rahi Global School
      </div>
    </div>
  );
}