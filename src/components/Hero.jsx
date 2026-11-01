import Button from "./Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F5FAFF]">
      {/* Decorative background shape */}
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-yellow/40 blur-2xl" />

      <div className="container-x grid min-h-[650px] items-center gap-12 py-16 lg:grid-cols-2">
        {/* Hero Content */}
        <div className="relative z-10">
          <span className="inline-flex rounded-full bg-yellow px-4 py-2 text-sm font-black text-navy">
            Admissions Open • 2026–27
          </span>

          <h1 className="mt-6 text-balance text-5xl font-black leading-[1.03] text-navy md:text-7xl">
            Where little minds{" "}
            <span className="text-sky">grow</span> into great futures.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            A joyful, caring and future-ready school where children learn with
            curiosity, discover their strengths and grow with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Button to="/admissions">
              Explore Admissions
            </Button>

            <Button to="/about" variant="secondary">
              Discover Our School
            </Button>
          </div>

          {/* Highlights */}
          <div className="mt-10 flex gap-8">
            <div>
              <b className="text-2xl font-black text-navy">
                100%
              </b>
              <p className="text-sm text-slate-500">
                Child-focused
              </p>
            </div>

            <div>
              <b className="text-2xl font-black text-navy">
                360°
              </b>
              <p className="text-sm text-slate-500">
                Holistic growth
              </p>
            </div>

            <div>
              <b className="text-2xl font-black text-navy">
                ∞
              </b>
              <p className="text-sm text-slate-500">
                Curiosity
              </p>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative">
          <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-yellow" />

          <div className="absolute -bottom-8 -right-8 h-36 w-36 rounded-[45%] bg-green/30" />

          <div className="relative overflow-hidden rounded-[3rem] border-8 border-white bg-white shadow-soft">
            <img
              src="/images/hero-kids.jpg"
              alt="Happy students at Rahi Global School"
              className="h-[480px] w-full object-cover object-[center_35%] sm:h-[520px] lg:h-[560px]"
            />

            <div className="absolute bottom-5 left-5 rounded-2xl bg-white/95 px-5 py-4 shadow-lg">
              <div className="font-black text-navy">
                Learn. Explore. Create.
              </div>

              <div className="text-sm text-slate-500">
                Every day is an adventure.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}