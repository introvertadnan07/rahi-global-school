import { useState } from "react";

const API_URL = "http://localhost:5000/api";

const initialForm = {
  parentName: "",
  studentClass: "",
  rating: "5",
  message: "",
};

export default function ParentFeedbackForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice({ type: "", text: "" });

    const payload = {
      parentName: form.parentName.trim(),
      studentClass: form.studentClass.trim(),
      rating: Number(form.rating),
      message: form.message.trim(),
    };

    if (payload.parentName.length < 2) {
      setNotice({ type: "error", text: "Please enter your full name." });
      return;
    }

    if (payload.message.length < 10) {
      setNotice({
        type: "error",
        text: "Please write at least 10 characters of feedback.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to submit feedback. Please try again.");
      }

      setForm(initialForm);
      setNotice({
        type: "success",
        text: data.message || "Thank you! Your feedback was submitted for review.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error.message ||
          "Could not connect to the server. Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container-x py-20">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[#102A56] px-6 py-8 text-white sm:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">
            Parent Voice
          </p>
          <h2 className="mt-2 text-3xl font-black">
            Share your experience
          </h2>
          <p className="mt-3 max-w-xl leading-7 text-white/80">
            Your feedback helps us improve. Submissions are reviewed by the
            school before they appear publicly on this website.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="parentName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Parent / Guardian Name *
              </label>
              <input
                id="parentName"
                name="parentName"
                type="text"
                autoComplete="name"
                minLength={2}
                maxLength={60}
                required
                value={form.parentName}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="studentClass"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Student's Class (optional)
              </label>
              <input
                id="studentClass"
                name="studentClass"
                type="text"
                maxLength={30}
                value={form.studentClass}
                onChange={handleChange}
                placeholder="e.g. Grade 3"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="rating"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Your Rating
            </label>
            <select
              id="rating"
              name="rating"
              value={form.rating}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
            >
              <option value="5">★★★★★ — Excellent</option>
              <option value="4">★★★★☆ — Very good</option>
              <option value="3">★★★☆☆ — Good</option>
              <option value="2">★★☆☆☆ — Needs improvement</option>
              <option value="1">★☆☆☆☆ — Poor</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Your Feedback *
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              minLength={10}
              maxLength={1000}
              required
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us about your experience with the school..."
              className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {form.message.length}/1000 characters
            </p>
          </div>

          {notice.text && (
            <div
              role="status"
              aria-live="polite"
              className={`rounded-xl border p-4 text-sm ${
                notice.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {notice.text}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-amber-400 px-6 py-3.5 font-bold text-[#102A56] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>

          <p className="text-xs leading-5 text-slate-500">
            Please do not include private student information. Your review will
            remain unpublished until the school approves it.
          </p>
        </form>
      </div>
    </section>
  );
}
