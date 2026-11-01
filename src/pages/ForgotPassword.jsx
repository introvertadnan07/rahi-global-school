import { useState } from "react";
import { Link } from "react-router-dom";
import { parentRequest } from "../lib/parentAuth";

const steps = [
  { number: 1, label: "Account" },
  { number: 2, label: "Verification" },
  { number: 3, label: "New password" },
];

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100";
  const buttonClass =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-900/15 transition duration-200 hover:-translate-y-0.5 hover:from-sky-700 hover:to-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";

  function clearMessages() {
    setMessage("");
    setError("");
  }

  async function requestOtp(event) {
    event.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      await parentRequest("/parents/password/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          identifier: identifier.trim(),
          method: "email",
        }),
      });

      setMessage(
        "If your account has a registered recovery email, a verification code will be sent."
      );
      setStep(2);
    } catch (err) {
      setError(err.message || "Unable to send email OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    clearMessages();

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const data = await parentRequest("/parents/password/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp,
        }),
      });

      setResetToken(data.resetToken);
      setMessage(data.message || "Email OTP verified successfully.");
      setStep(3);
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    clearMessages();

    if (password.length < 8 || password.length > 12) {
      setError("Your password must contain 8 to 12 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match. Please try again.");
      return;
    }

    if (!resetToken) {
      setError("Your reset session is missing. Please request a new OTP.");
      setStep(1);
      return;
    }

    setLoading(true);

    try {
      const data = await parentRequest("/parents/password/reset-password", {
        method: "POST",
        body: JSON.stringify({
          identifier: identifier.trim(),
          resetToken,
          newPassword: password,
        }),
      });

      setMessage(data.message || "Your password has been reset successfully.");
      setStep(4);
      setPassword("");
      setConfirmPassword("");
      setResetToken("");
    } catch (err) {
      setError(err.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    clearMessages();
    setLoading(true);

    try {
      await parentRequest("/parents/password/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          identifier: identifier.trim(),
          method: "email",
        }),
      });

      setMessage(
        "If your account is eligible, a new OTP has been sent to your registered recovery email."
      );
    } catch (err) {
      setError(err.message || "Unable to resend email OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative isolate min-h-[75vh] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50 px-4 py-12 sm:py-16">
      <div className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="mx-auto max-w-lg">
        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-[0_24px_80px_-28px_rgba(15,23,42,0.28)] backdrop-blur">
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-sky-900 px-6 py-7 text-white sm:px-9">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-inner">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3 5 6v5c0 4.5 2.9 8.1 7 10 4.1-1.9 7-5.5 7-10V6l-7-3Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-200">
                  Rahi Global School
                </p>
                <p className="mt-1 text-sm text-blue-100">
                  Secure parent account access
                </p>
              </div>
            </div>

            <h1 className="mt-7 text-3xl font-bold tracking-tight sm:text-4xl">
              {step === 4 ? "Password updated" : "Reset your password"}
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-blue-100">
              {step === 1 && "Recover access to your parent account in a few secure steps."}
              {step === 2 && "Enter the verification code sent to your registered recovery email."}
              {step === 3 && "Choose a new password to secure your account."}
              {step === 4 && "Your new password is ready. You can now sign in securely."}
            </p>
          </div>

          <div className="px-6 py-7 sm:px-9 sm:py-9">
            {step !== 4 && (
              <div className="mb-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Account recovery
                  </span>
                  <span className="text-xs font-semibold text-sky-700">
                    Step {step} of 3
                  </span>
                </div>
                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-700 transition-all duration-500"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {steps.map((item) => {
                    const complete = step > item.number;
                    const active = step === item.number;
                    return (
                      <div key={item.number} className="flex items-center gap-2">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            complete || active
                              ? "bg-sky-600 text-white"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {complete ? "✓" : item.number}
                        </span>
                        <span
                          className={`hidden text-xs font-medium sm:inline ${
                            active ? "text-sky-800" : "text-slate-500"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {message && (
              <div
                role="status"
                className="mb-5 flex gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm leading-5 text-sky-900"
              >
                <span className="mt-0.5 font-bold text-sky-600">✓</span>
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-5 flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-5 text-red-800"
              >
                <span className="mt-0.5 font-bold text-red-600">!</span>
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={requestOtp} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Username or registered mobile number
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Enter your username or mobile number"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Email verification</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        A one-time verification code will be sent to the recovery email linked to your parent account.
                      </p>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? "Sending verification code..." : "Send Email OTP"}
                  {!loading && <span aria-hidden="true">→</span>}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={verifyOtp} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Six-digit verification code
                  </label>
                  <input
                    className={`${inputClass} text-center text-xl font-bold tracking-[0.45em]`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="••••••"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Check your inbox and enter the code before it expires.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className={buttonClass}
                >
                  {loading ? "Verifying code..." : "Verify OTP"}
                  {!loading && <span aria-hidden="true">→</span>}
                </button>

                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 disabled:opacity-60"
                >
                  Resend Email OTP
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={resetPassword} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      className={`${inputClass} pr-20`}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a new password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={8}
                      maxLength={12}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute inset-y-0 right-3 my-auto h-9 px-2 text-xs font-semibold text-sky-700 hover:text-sky-900"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      className={`${inputClass} pr-20`}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Enter your new password again"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      minLength={8}
                      maxLength={12}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute inset-y-0 right-3 my-auto h-9 px-2 text-xs font-semibold text-sky-700 hover:text-sky-900"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-700">
                    Password requirements
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Use 8–12 characters. Both password fields must match.
                  </p>
                </div>

                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? "Updating password..." : "Reset Password"}
                  {!loading && <span aria-hidden="true">→</span>}
                </button>
              </form>
            )}

            {step === 4 && (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600 ring-8 ring-emerald-50/70">
                  ✓
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Password reset successful
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Your parent account password has been updated. Sign in using your new password.
                </p>
                <Link
                  to="/parent/login"
                  className={`${buttonClass} mt-7`}
                >
                  Go to Parent Login <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}

            {step !== 4 && (
              <div className="mt-7 border-t border-slate-100 pt-5 text-center">
                <Link
                  to="/parent/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-sky-700"
                >
                  <span aria-hidden="true">←</span>
                  Back to Parent Login
                </Link>
              </div>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          Rahi Global School · Secure Parent Portal
        </p>
      </div>
    </section>
  );
}
