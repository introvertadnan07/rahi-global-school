import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { parentRequest, saveParentSession } from "../lib/parentAuth";

export default function ParentAuth({ mode = "login" }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/parents/register" : "/parents/login";

      const payload = isRegister
        ? { name: name.trim(), username: username.trim().toLowerCase(), phone: phone.trim(), email: email.trim().toLowerCase(), password }
        : { identifier: identifier.trim(), password };

      const data = await parentRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!data.token) throw new Error("Authentication token was not returned.");

      saveParentSession(data.token, data.parent);
      navigate("/parent/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-sky-500";

  return (
    <section className="min-h-[70vh] bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-sky-600">
          Rahi Global School
        </p>

        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          {isRegister ? "Parent Registration" : "Parent Login"}
        </h1>

        <p className="mb-6 text-sm text-slate-600">
          {isRegister ? "Create your parent account to submit and track admission enquiries." : "Sign in to view your admission enquiries."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Parent / Guardian Name</label>
                <input required maxLength={100} value={name} onChange={e => setName(e.target.value)} autoComplete="name" placeholder="Enter your full name" className={inputClass} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                <input required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_.-]+" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" placeholder="Choose a username" className={inputClass} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Mobile Number</label>
                <input required maxLength={20} value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" placeholder="Enter your mobile number" className={inputClass} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
                <input required type="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="Enter your email address" className={inputClass} />
              </div>
            </>
          )}

          {!isRegister && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Username or Mobile Number</label>
              <input required value={identifier} onChange={e => setIdentifier(e.target.value)} autoComplete="username" placeholder="Enter username or mobile number" className={inputClass} />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input required minLength={isRegister ? 8 : 1} maxLength={isRegister ? 12 : 128} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={isRegister ? "new-password" : "current-password"} placeholder={isRegister ? "Enter 8 to 12 characters" : "Enter password"} className={inputClass} />
          </div>

          {!isRegister && (
            <div className="text-right">
              <Link to="/parent/forgot-password" className="text-sm font-semibold text-sky-700 hover:underline">
                Forgot Password?
              </Link>
            </div>
          )}

          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {isRegister ? "Already have an account?" : "New parent?"}{" "}
          <Link to={isRegister ? "/parent/login" : "/parent/register"} className="font-semibold text-sky-700 hover:underline">
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </div>
    </section>
  );
}
