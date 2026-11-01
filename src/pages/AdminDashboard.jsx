import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [admissions, setAdmissions] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackUpdatingId, setFeedbackUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const logout = useCallback(() => {
    sessionStorage.removeItem("rahiAdminToken");
    sessionStorage.removeItem("rahiAdminUsername");
    sessionStorage.removeItem("rahiAdminType");
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  const apiRequest = useCallback(async (path, options = {}) => {
    const token = sessionStorage.getItem("rahiAdminToken");

    if (!token) {
      throw new Error("SESSION_EXPIRED");
    }

    let response;

    try {
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });
    } catch {
      throw new Error(
        "Cannot connect to the server. Check that the backend is running on port 5000."
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error("SESSION_EXPIRED");
    }

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("The server returned an invalid response.");
    }

    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Request failed. Please try again.");
    }

    return data;
  }, []);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        
    const [dashboardData, admissionsData, contactsData, feedbackData] =
    await Promise.all([
    apiRequest("/admin/dashboard"),
    apiRequest("/admin/admissions"),
    apiRequest("/admin/contacts"),
    apiRequest("/feedback"),
  ]);


        setStats(dashboardData.stats ?? dashboardData);
        setAdmissions(admissionsData.admissions ?? []);
        setContacts(contactsData.contacts ?? []);
        setFeedbackList(feedbackData.feedback ?? []);
        setLastUpdated(new Date());
      } catch (err) {
        if (err.message === "SESSION_EXPIRED") {
          logout();
          return;
        }

        setError(
          err.message || "Unable to load dashboard. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [apiRequest, logout]
  );

  useEffect(() => {
    if (!sessionStorage.getItem("rahiAdminToken")) {
      logout();
      return;
    }

    loadDashboard();
  }, [loadDashboard, logout]);

  async function updateStatus(id, status) {
    setUpdatingId(id);
    setError("");

    try {
      await apiRequest(`/admin/admissions/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      await loadDashboard(true);
    } catch (err) {
      if (err.message === "SESSION_EXPIRED") {
        logout();
      } else {
        setError(err.message || "Status update failed.");
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function updateFeedbackStatus(id, status) {
    setFeedbackUpdatingId(id);
    setError("");

    try {
      await apiRequest(`/feedback/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setFeedbackList((current) =>
        current.map((item) =>
          item._id === id ? { ...item, status } : item
        )
      );
    } catch (err) {
      if (err.message === "SESSION_EXPIRED") {
        logout();
      } else {
        setError(err.message || "Feedback status update failed.");
      }
    } finally {
      setFeedbackUpdatingId(null);
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-900 border-t-transparent" />
          <p className="font-medium text-slate-600">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Admissions",
      value: stats?.totalAdmissions ?? 0,
    },
    {
      label: "New Admissions",
      value: stats?.newAdmissions ?? 0,
    },
    {
      label: "Contact Enquiries",
      value: stats?.totalContacts ?? 0,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-800 md:flex">
      {/* Premium school admin sidebar */}
      <aside className="relative z-10 flex w-full flex-col bg-[#101f42] text-white md:min-h-screen md:w-[270px] md:shrink-0">
        <div className="border-b border-white/10 px-6 py-7">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d6b66b]/50 bg-white/10 text-sm font-black tracking-wide text-[#e5c982]">
            RG
          </div>
          <h1 className="text-lg font-bold tracking-wide">Rahi Global School</h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-[#d6b66b]">Administration</p>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 py-5 md:flex-1 md:flex-col">
          <a href="#overview" className="flex shrink-0 items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/10">
            <span className="text-[#e5c982]">01</span> Overview
          </a>
          <a href="#admissions" className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm text-blue-100 transition hover:bg-white/10 hover:text-white">
            <span className="text-[#e5c982]">02</span> Admissions
          </a>
          <a href="#feedback" className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm text-blue-100 transition hover:bg-white/10 hover:text-white">
            <span className="text-[#e5c982]">03</span> Parent Feedback
          </a>
          <a href="#contacts" className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm text-blue-100 transition hover:bg-white/10 hover:text-white">
            <span className="text-[#e5c982]">04</span> Contact Enquiries
          </a>
        </nav>

        <div className="hidden border-t border-white/10 p-5 md:block">
          <p className="text-xs text-blue-200">School administration portal</p>
          <p className="mt-1 text-xs text-white/50">Secure management workspace</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-5 py-4 shadow-[0_3px_18px_rgba(15,23,42,0.03)] sm:px-8 lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a78335]">School management</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#101f42]">Administration portal</h1>
          <p className="mt-1 text-sm text-slate-500">
            Signed in as{" "}
            <span className="font-semibold text-[#17345F]">
              {sessionStorage.getItem("rahiAdminType") === "owner"
                ? "School Owner"
                : sessionStorage.getItem("rahiAdminType") === "principal"
                  ? "Principal"
                  : "Administrator"}
            </span>
            {" · "}
            {sessionStorage.getItem("rahiAdminUsername") || "Administrator"}
          </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#d6b66b] hover:bg-amber-50"
            >
              ← Home Page
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl bg-[#101f42] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a315f]"
            >
              Logout
            </button>
          </div>
        </header>

      <main className="mx-auto max-w-[1500px] space-y-8 px-4 py-7 sm:px-6 lg:px-10" id="overview">
        {/* Premium welcome banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#101f42] via-[#182e58] to-[#243d68] p-6 text-white shadow-[0_18px_45px_rgba(16,31,66,0.16)] sm:p-8">
          <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -right-2 -top-8 h-40 w-40 rounded-full border border-[#d6b66b]/30" />
          <div className="relative max-w-2xl">
            <span className="inline-flex rounded-full border border-[#d6b66b]/40 bg-[#d6b66b]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f0d99d]">Admin workspace</span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">School at a glance</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">A clear overview of admissions, parent feedback and school enquiries—all in one place.</p>
          </div>
        </section>

        {/* Dashboard heading and Refresh button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#101f42]">
              Dashboard Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage school admissions and contact enquiries.
            </p>

            {lastUpdated && (
              <p className="mt-2 text-xs text-slate-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing || updatingId !== null}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101f42] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a315f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              className={refreshing ? "animate-spin" : ""}
              aria-hidden="true"
            >
              ↻
            </span>
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>

            {error !== "SESSION_EXPIRED" && (
              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="font-semibold underline disabled:opacity-50"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {/* Statistics cards */}
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.045)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(15,23,42,0.09)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#101f42] via-[#d6b66b] to-transparent" />
              <p className="text-sm font-semibold text-slate-500">
                {card.label}
              </p>

              <p className="mt-3 text-4xl font-bold tracking-tight text-[#101f42]">
                {card.value}
              </p>
            </div>
          ))}
        </section>

        {/* Admission enquiries */}
        <section id="admissions" className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(16,31,66,0.07)] transition-shadow duration-200 hover:shadow-[0_18px_48px_rgba(16,31,66,0.10)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-gradient-to-r from-white via-white to-[#fbf8ef] px-5 py-5 sm:px-7">
            <h3 className="border-l-[3px] border-[#c7a65b] pl-3 text-lg font-bold tracking-tight text-[#101f42]">
              Admission Enquiries
            </h3>

            <span className="inline-flex items-center rounded-full border border-[#e7d8ad] bg-[#fbf7e9] px-3.5 py-1.5 text-xs font-bold text-[#7b6128]">
              {admissions.length} records
            </span>
          </div>

          {admissions.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">
              No admissions found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-[#f6f7fb] text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-[18px] align-middle">Student / Parent</th>
                    <th className="px-5 py-[18px] align-middle">Contact</th>
                    <th className="px-5 py-[18px] align-middle">Class</th>
                    <th className="px-5 py-[18px] align-middle">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100/90">
                  {admissions.map((item) => (
                    <tr key={item._id} className="transition-colors odd:bg-white even:bg-[#fcfcfe] hover:bg-[#fbf7e9]">
                      <td className="px-5 py-[18px] align-middle">
                        <p className="font-semibold text-slate-900">
                          {item.childName || "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Parent: {item.parentName || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-[18px] align-middle">
                        <p>{item.phone || "—"}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.email || ""}
                        </p>
                      </td>

                      <td className="px-5 py-[18px] align-middle">
                        {item.classApplyingFor || "—"}
                      </td>

                      <td className="px-5 py-[18px] align-middle">
                        <select
                          value={item.status || "new"}
                          disabled={
                            updatingId === item._id ||
                            refreshing
                          }
                          onChange={(e) =>
                            updateStatus(item._id, e.target.value)
                          }
                          aria-label={`Update status for ${item.childName || "admission"}`}
                          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold capitalize text-[#172747] shadow-sm outline-none transition focus:border-[#c7a65b] focus:ring-4 focus:ring-[#c7a65b]/15 disabled:cursor-wait disabled:opacity-60"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="completed">Completed</option>
                        </select>

                        {updatingId === item._id && (
                          <p className="mt-1 text-xs text-slate-500">
                            Updating...
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Parent Feedback Management */}
        <section id="feedback" className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(16,31,66,0.07)] transition-shadow duration-200 hover:shadow-[0_18px_48px_rgba(16,31,66,0.10)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-gradient-to-r from-white via-white to-[#fbf8ef] px-5 py-5 sm:px-7">
            <h3 className="border-l-[3px] border-[#c7a65b] pl-3 text-lg font-bold tracking-tight text-[#101f42]">
              Parent Feedback Management
            </h3>
            <span className="inline-flex items-center rounded-full border border-[#e7d8ad] bg-[#fbf7e9] px-3.5 py-1.5 text-xs font-bold text-[#7b6128]">
              {feedbackList.length} records
            </span>
          </div>

          {feedbackLoading ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">Loading parent feedback...</p>
          ) : feedbackList.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">No parent feedback found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-[#f6f7fb] text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-[18px] align-middle">Parent</th>
                    <th className="px-5 py-[18px] align-middle">Student Class</th>
                    <th className="px-5 py-[18px] align-middle">Rating</th>
                    <th className="px-5 py-[18px] align-middle">Feedback</th>
                    <th className="px-5 py-[18px] align-middle">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/90">
                  {feedbackList.map((item) => (
                    <tr key={item._id} className="transition-colors odd:bg-white even:bg-[#fcfcfe] hover:bg-[#fbf7e9]">
                      <td className="px-5 py-[18px] align-middle font-semibold text-[#172747]">
                        {item.parentName || "—"}
                      </td>
                      <td className="px-5 py-[18px] align-middle">
                        {item.studentClass || "—"}
                      </td>
                      <td className="px-5 py-[18px] align-middle">
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#ead9a7] bg-[#fffaf0] px-3 py-2 font-bold tabular-nums text-[#8a6a22]">
                          <span aria-hidden="true">★</span> {item.rating ?? "—"} <span className="text-xs font-medium text-[#a18a56]">/ 5</span>
                        </span>
                      </td>
                      <td className="max-w-md whitespace-pre-wrap px-5 py-[18px] align-middle leading-6 text-slate-600">
                        {item.feedback || item.message || item.comments || "—"}
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <div className="flex min-w-[190px] flex-col items-start gap-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-bold capitalize tracking-wide ${
                              String(item.status || "pending").toLowerCase() === "approved"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : String(item.status || "pending").toLowerCase() === "rejected"
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : "border-amber-200 bg-amber-50 text-amber-800"
                            }`}
                          >
                            {item.status || "Pending"}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => updateFeedbackStatus(item._id, "approved")}
                              disabled={feedbackUpdatingId === item._id || String(item.status || "").toLowerCase() === "approved"}
                              className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {feedbackUpdatingId === item._id ? "Saving..." : "Accept"}
                            </button>
                            <button
                              type="button"
                              onClick={() => updateFeedbackStatus(item._id, "rejected")}
                              disabled={feedbackUpdatingId === item._id || String(item.status || "").toLowerCase() === "rejected"}
                              className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        {/* Contact enquiries */}
        <section id="contacts" className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(16,31,66,0.07)] transition-shadow duration-200 hover:shadow-[0_18px_48px_rgba(16,31,66,0.10)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-gradient-to-r from-white via-white to-[#fbf8ef] px-5 py-5 sm:px-7">
            <h3 className="border-l-[3px] border-[#c7a65b] pl-3 text-lg font-bold tracking-tight text-[#101f42]">
              Contact Enquiries
            </h3>

            <span className="inline-flex items-center rounded-full border border-[#e7d8ad] bg-[#fbf7e9] px-3.5 py-1.5 text-xs font-bold text-[#7b6128]">
              {contacts.length} records
            </span>
          </div>

          {contacts.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">
              No contact enquiries found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-[#f6f7fb] text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-[18px] align-middle">Name</th>
                    <th className="px-5 py-[18px] align-middle">Contact</th>
                    <th className="px-5 py-[18px] align-middle">Message</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100/90">
                  {contacts.map((item) => (
                    <tr key={item._id} className="transition-colors odd:bg-white even:bg-[#fcfcfe] hover:bg-[#fbf7e9]">
                      <td className="px-5 py-[18px] align-middle font-semibold text-[#172747]">
                        {item.name || "—"}
                      </td>

                      <td className="px-5 py-[18px] align-middle">
                        <p>{item.phone || "—"}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.email || ""}
                        </p>
                      </td>

                      <td className="max-w-md whitespace-pre-wrap px-5 py-[18px] align-middle leading-6 text-slate-600">
                        {item.message || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-center text-xs text-slate-400">
          Rahi Global School · Admin Panel
        </p>
      </main>
      </div>
    </div>
  );
}


