import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  clearParentSession,
  getParentUser,
  parentRequest,
} from "../lib/parentAuth";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [parent, setParent] = useState(getParentUser());
  const [admissions, setAdmissions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailStep, setEmailStep] = useState(1);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const logout = useCallback(() => {
    clearParentSession();
    navigate("/parent/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [profileData, admissionData] = await Promise.all([
          parentRequest("/parents/me"),
          parentRequest("/parents/admissions"),
        ]);

        if (active) {
          const currentParent = profileData.parent || profileData;
          setParent(currentParent);
          setRecoveryEmail(currentParent.email || "");
          setEmailStep(currentParent.emailVerified ? 3 : 1);

          const items = admissionData.admissions || admissionData.data || [];
          setAdmissions(Array.isArray(items) ? items : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load your dashboard.");

          if (/token|unauthori[sz]ed|forbidden|expired/i.test(err.message)) {
            logout();
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [logout]);

  async function sendEmailOtp(event) {
    event.preventDefault();
    setEmailMessage("");
    setEmailError("");

    if (!recoveryEmail.trim()) {
      setEmailError("Please enter your recovery email.");
      return;
    }

    setEmailLoading(true);

    try {
      const data = await parentRequest("/parents/email/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: recoveryEmail.trim() }),
      });

      if (data.alreadyVerified) {
        setParent((current) => ({
          ...current,
          email: recoveryEmail.trim(),
          emailVerified: true,
        }));
        setEmailStep(3);
        setEmailMessage(data.message || "This email is already verified.");
        return;
      }

      setOtp("");
      setEmailStep(2);
      setEmailMessage(data.message || "Verification OTP sent to your email.");
    } catch (err) {
      setEmailError(err.message || "Unable to send verification OTP.");
    } finally {
      setEmailLoading(false);
    }
  }

  async function verifyEmailOtp(event) {
    event?.preventDefault();

    if (emailLoading) return;

    if (!/^\d{6}$/.test(otp)) {
      setEmailError("Please enter a valid 6-digit OTP.");
      return;
    }

    setEmailMessage("");
    setEmailError("");
    setEmailLoading(true);

    try {
      const data = await parentRequest("/parents/email/verify-otp", {
        method: "POST",
        body: JSON.stringify({ otp }),
      });

      if (data.parent) {
        setParent(data.parent);
        setRecoveryEmail(data.parent.email || "");
      } else {
        setParent((current) => ({ ...current, emailVerified: true }));
      }

      setEmailStep(3);
      setOtp("");
      setEmailMessage(data.message || "Recovery email verified successfully.");
    } catch (err) {
      setEmailError(err.message || "Email verification failed.");
    } finally {
      setEmailLoading(false);
    }
  }

  function handleOtpKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!emailLoading && /^\d{6}$/.test(otp)) {
        event.currentTarget.form?.requestSubmit();
      }
    }
  }

  function changeRecoveryEmail() {
    setEmailStep(1);
    setOtp("");
    setEmailMessage("");
    setEmailError("");
  }

  return (
    <section className="min-h-[70vh] bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
              Rahi Global School
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Parent Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Welcome{parent?.name ? `, ${parent.name}` : ""}.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>

        {/* Recovery Email Section */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recovery Email
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Verify your email to reset your password if you forget it.
              </p>
            </div>

            {parent?.emailVerified ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                Verified
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                Not verified
              </span>
            )}
          </div>

          {emailStep === 3 && parent?.emailVerified ? (
            <div className="mt-4 rounded-lg bg-green-50 p-4">
              <p className="font-medium text-green-800">
                Recovery email verified successfully.
              </p>
              <p className="mt-1 text-sm text-green-700">{parent.email}</p>
              <button
                type="button"
                onClick={changeRecoveryEmail}
                className="mt-3 rounded-lg border border-green-300 px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-100"
              >
                Change Email
              </button>
            </div>
          ) : (
            <>
              {emailStep === 1 && (
                <form onSubmit={sendEmailOtp} className="mt-4 space-y-3">
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(event) => setRecoveryEmail(event.target.value)}
                    placeholder="Enter your recovery email"
                    maxLength={254}
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
                  />

                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="rounded-lg bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {emailLoading ? "Sending..." : "Send Verification OTP"}
                  </button>
                </form>
              )}

              {emailStep === 2 && (
                <form onSubmit={verifyEmailOtp} className="mt-4 space-y-3">
                  <p className="text-sm text-slate-600">
                    Enter the six-digit OTP sent to {recoveryEmail}.
                  </p>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    onKeyDown={handleOtpKeyDown}
                    placeholder="Enter 6-digit OTP"
                    aria-label="Six-digit email verification OTP"
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 tracking-widest outline-none focus:border-sky-500"
                  />

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={emailLoading || otp.length !== 6}
                      className="rounded-lg bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {emailLoading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <button
                      type="button"
                      disabled={emailLoading}
                      onClick={changeRecoveryEmail}
                      className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      Change Email
                    </button>
                  </div>
                </form>
              )}

              {emailMessage && (
                <p className="mt-3 rounded-lg bg-sky-50 p-3 text-sm text-sky-800">
                  {emailMessage}
                </p>
              )}

              {emailError && (
                <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {emailError}
                </p>
              )}
            </>
          )}
        </div>

        {/* Admission Enquiries */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            My admission enquiries
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            View the enquiries submitted through your parent account.
          </p>
          <Link
            to="/admissions"
            className="mt-4 inline-block rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-300"
          >
            Submit an enquiry
          </Link>
        </div>

        {loading && (
          <p className="py-6 text-slate-600">Loading your enquiries...</p>
        )}

        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && admissions.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              No enquiries yet
            </h2>
            <p className="mt-2 text-slate-600">
              Your submitted admission enquiries will appear here.
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {admissions.map((item) => (
            <article
              key={item._id || item.enquiryId}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-semibold text-slate-900">
                  {item.childName || "Student"}
                </h2>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-800">
                  {item.status || "Submitted"}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Enquiry ID: {item.enquiryId || item._id || "Pending"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Class: {item.classApplyingFor || "Not specified"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Submitted:{" "}
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
