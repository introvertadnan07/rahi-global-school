import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Server returned an invalid response (HTTP ${response.status}).`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Login failed (${response.status}).`);
      }

      if (!data.token) {
        throw new Error("Login succeeded, but the authentication token is missing.");
      }

      sessionStorage.setItem("rahiAdminToken", data.token);
      sessionStorage.setItem("rahiAdminUsername", data.username);
      sessionStorage.setItem("rahiAdminType", data.adminType);

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.error("Admin login error:", err);

      if (err instanceof TypeError) {
        setError(
          "Unable to connect to the login API. Check that the backend is running on port 5000 and that CORS is configured correctly."
        );
      } else {
        setError(err.message || "Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071426] px-4 py-10 sm:px-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[450px] w-[450px] rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-2">
        {/* Left brand panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#102c52] via-[#173c6a] to-[#071426] p-10 text-white lg:flex xl:p-12">
          <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-12 top-36 h-48 w-48 rounded-full border border-white/10" />

          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/40 bg-white/10 text-2xl font-bold text-amber-300 shadow-lg">
                R
              </div>

              <div>
                <p className="text-lg font-bold tracking-wide">
                  RAHI GLOBAL SCHOOL
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-blue-200">
                  Learn Â· Lead Â· Inspire
                </p>
              </div>
            </div>
          </div>

          <div className="relative my-12">
            <div className="mb-6 h-1 w-14 rounded-full bg-amber-400" />

            <h1 className="max-w-sm text-4xl font-semibold leading-tight xl:text-5xl">
              Empowering
              <span className="mt-2 block text-amber-300">
                tomorrow&apos;s
              </span>
              leaders.
            </h1>

            <p className="mt-6 max-w-sm text-base leading-7 text-blue-100/80">
              Your central space to manage admissions, support families and
              help every student begin their journey.
            </p>
          </div>

          <div className="relative flex items-center gap-3 border-t border-white/15 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-medium">
                Secure administrator access
              </p>
              <p className="mt-1 text-xs text-blue-200/70">
                Restricted to authorized school staff
              </p>
            </div>
          </div>
        </section>

        {/* Login form */}
        <section className="flex items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-12 xl:px-14">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="mb-9 lg:hidden">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#102c52] text-2xl font-bold text-amber-300 shadow-lg">
                R
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
                Rahi Global School
              </p>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
                Administration Portal
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in to access your school&apos;s management dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="admin-username"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Username
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-2a8 8 0 0 1 16 0v2Z" />
                    </svg>
                  </span>

                  <input
                    id="admin-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#24477f] focus:bg-white focus:ring-4 focus:ring-blue-900/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="admin-password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <span className="text-xs text-slate-400">
                    Authorized users only
                  </span>
                </div>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  </span>

                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#24477f] focus:bg-white focus:ring-4 focus:ring-blue-900/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M3 3 21 21" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 5.2A11 11 0 0 1 12 5c5 0 8.5 4.2 10 7-.6 1.2-1.5 2.5-2.7 3.6" />
                        <path d="M6.2 6.2C3.8 7.7 2.5 10 2 12c1.5 2.8 5 7 10 7 1.1 0 2.1-.2 3-.6" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#102c52] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-950/15 transition duration-200 hover:-translate-y-0.5 hover:bg-[#183d70] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="3"
                        opacity=".25"
                      />
                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to dashboard
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Security notice */}
            <div className="mt-7 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                aria-hidden="true"
              >
                <path d="M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>

              <p className="text-xs leading-5 text-slate-500">
                This portal is restricted to authorized school administrators.
                Keep your login credentials private.
              </p>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400">
              Â© {new Date().getFullYear()} Rahi Global School
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

