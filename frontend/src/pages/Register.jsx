import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../lib/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await register(email, password);
    setLoading(false);
    if (res.ok) nav("/login");
    else {
      const data = await res.json().catch(() => ({}));
      setError(data.detail || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-blue-800 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-brand-900 mb-1">Create account</h1>
        <p className="text-gray-500 text-sm mb-6">Register for the Risk Copilot</p>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Have an account? <Link to="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
