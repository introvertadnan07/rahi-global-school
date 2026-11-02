import { useState } from "react";
import {
  Home,
  Search,
  GraduationCap,
  CheckCircle2,
  Clock3,
  FileCheck2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdmissionTracker() {
  const [enquiryId, setEnquiryId] = useState("");
  const [email, setEmail] = useState("");
  const [enquiry, setEnquiry] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setEnquiry(null);
    setError("");
    setLoading(true);

    try {
      const params = new URLSearchParams({
        email: email.trim(),
      });

      const response = await fetch(
        `${API_URL}/admissions/track/${encodeURIComponent(
          enquiryId.trim()
        )}?${params.toString()}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to find this enquiry."
        );
      }

      setEnquiry(result.enquiry);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  const statusLabels = {
    new: "Enquiry Received",
    contacted: "Contacted by School",
    completed: "Enquiry Completed",
  };

  const statusSteps = [
    { key: "new", label: "Enquiry Received", icon: FileCheck2 },
    { key: "contacted", label: "School Contact", icon: Clock3 },
    { key: "completed", label: "Enquiry Completed", icon: CheckCircle2 },
  ];

  const currentStep = enquiry
    ? Math.max(
        0,
        statusSteps.findIndex((step) => step.key === enquiry.status)
      )
    : -1;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb] text-slate-800">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 top-32 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-96 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#102b52] text-amber-300 shadow-md shadow-blue-950/15">
              <GraduationCap size={25} />
            </div>
            <div>
              <p className="text-sm font-black tracking-wide text-[#102b52] sm:text-base">
                RAHI GLOBAL SCHOOL
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-600">
                Learn • Grow • Lead
              </p>
            </div>
          </a>

          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#102b52]/15 bg-white px-4 py-2.5 text-sm font-bold text-[#102b52] shadow-sm transition hover:border-amber-400 hover:bg-amber-50 sm:px-5"
          >
            <Home size={17} />
            <span>Home</span>
          </a>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
            <ShieldCheck size={15} />
            Admission Enquiry Portal
          </div>

          <h1 className="text-3xl font-black leading-tight tracking-tight text-[#102b52] sm:text-5xl">
            Track Your Admission
            <span className="block text-amber-600">Enquiry</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            Stay informed about your child's admission enquiry.
            Enter your enquiry reference and registered email
            address to view the latest update.
          </p>
        </div>

        {/* Search card */}
        <section className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_70px_-25px_rgba(16,43,82,0.22)]">
          <div className="h-1.5 bg-gradient-to-r from-[#102b52] via-amber-400 to-[#102b52]" />

          <div className="p-6 sm:p-10">
            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#102b52]">
                <Search size={23} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#102b52]">
                  Enquiry Details
                </h2>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Enter the details used during registration.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Enquiry ID
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-[#102b52] outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                  value={enquiryId}
                  onChange={(event) => setEnquiryId(event.target.value)}
                  placeholder="e.g. RGS-2026-000001"
                  maxLength={100}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Registered Email Address
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-[#102b52] outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </label>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#102b52] px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-950/15 transition hover:-translate-y-0.5 hover:bg-[#183d70] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Checking your enquiry..." : "Check Enquiry Status"}
                {!loading && (
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-amber-600"
              />
              <p className="text-xs leading-5 text-slate-500">
                Your enquiry information is checked against the
                registered email address for verification.
              </p>
            </div>
          </div>
        </section>

        {/* Result card */}
        {enquiry && (
          <section
            aria-live="polite"
            className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_-25px_rgba(16,43,82,0.2)]"
          >
            <div className="bg-[#102b52] px-6 py-6 text-white sm:px-9">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                Admission Update
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {statusLabels[enquiry.status] || "Status Updated"}
              </h2>
              <p className="mt-2 text-sm text-blue-100">
                Here is the latest information about your enquiry.
              </p>
            </div>

            <div className="p-6 sm:p-9">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Your Enquiry Reference
                </p>
                <p className="mt-2 break-all text-xl font-black tracking-wide text-[#102b52]">
                  {enquiry.enquiryId}
                </p>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    Student Name
                  </p>
                  <p className="mt-2 font-bold text-[#102b52]">
                    {enquiry.childName}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    Applying For
                  </p>
                  <p className="mt-2 font-bold text-[#102b52]">
                    {enquiry.classApplyingFor}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-xs font-semibold text-slate-500">
                    Enquiry Submitted
                  </p>
                  <p className="mt-2 font-bold text-[#102b52]">
                    {enquiry.submittedAt
                      ? new Date(enquiry.submittedAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "Date unavailable"}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-9">
                <h3 className="text-sm font-extrabold text-[#102b52]">
                  Enquiry Progress
                </h3>

                <div className="mt-6 space-y-5">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isComplete = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                      <div key={step.key} className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            isComplete
                              ? "bg-[#102b52] text-amber-300"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <Icon size={19} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-bold ${
                              isComplete
                                ? "text-[#102b52]"
                                : "text-slate-400"
                            }`}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="mt-1 text-xs font-semibold text-amber-700">
                              Current stage
                            </p>
                          )}
                        </div>
                        {isComplete && (
                          <CheckCircle2
                            size={19}
                            className="shrink-0 text-emerald-600"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-sm leading-6 text-amber-950">
                  This page displays your admission enquiry status.
                  It does not represent final admission confirmation.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="mx-auto mb-4 h-px max-w-xs bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <p className="text-xs font-semibold tracking-wide text-slate-500">
            RAHI GLOBAL SCHOOL
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Building bright futures through quality education.
          </p>
        </footer>
      </div>
    </main>
  );
}
