
import { useState } from "react";

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

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
            Rahi Global School
          </p>

          <h1 className="mt-3 text-3xl font-black text-blue-950 sm:text-5xl">
            Track Your Admission Enquiry
          </h1>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
            Enter your enquiry ID and registered email address
            to check your latest admission enquiry status.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"
        >
          <label className="block text-sm font-semibold text-slate-700">
            Enquiry ID
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              value={enquiryId}
              onChange={(event) => setEnquiryId(event.target.value)}
              placeholder="Paste your enquiry ID"
              maxLength={100}
              required
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Registered Email Address
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
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
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-blue-950 px-6 py-3.5 font-bold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Checking..." : "Check Enquiry Status"}
          </button>
        </form>

        {enquiry && (
          <section
            aria-live="polite"
            className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Current Status
            </p>

            <h2 className="mt-2 text-2xl font-black text-blue-950">
              {statusLabels[enquiry.status] || "Status Updated"}
            </h2>

            <div className="mt-6 space-y-4 border-t border-slate-100 pt-5 text-sm">
              <p>
                <span className="font-semibold text-slate-500">
                  Enquiry ID:
                </span>{" "}
                <span className="break-all font-medium text-slate-900">
                  {enquiry.enquiryId}
                </span>
              </p>

              <p>
                <span className="font-semibold text-slate-500">
                  Student:
                </span>{" "}
                <span className="font-medium text-slate-900">
                  {enquiry.childName}
                </span>
              </p>

              <p>
                <span className="font-semibold text-slate-500">
                  Class:
                </span>{" "}
                <span className="font-medium text-slate-900">
                  {enquiry.classApplyingFor}
                </span>
              </p>

              <p>
                <span className="font-semibold text-slate-500">
                  Submitted:
                </span>{" "}
                <span className="font-medium text-slate-900">
                  {new Date(enquiry.submittedAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </span>
              </p>
            </div>

            <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              This page shows your enquiry status, not final
              admission confirmation.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
