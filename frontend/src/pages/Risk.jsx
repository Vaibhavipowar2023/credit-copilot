import { useState, useEffect } from "react";
import { getCovenants, checkRisk } from "../lib/api";
import { Shield, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

export default function Risk() {
  const [covenants, setCovenants] = useState([]);
  const [covenantId, setCovenantId] = useState("");
  const [period, setPeriod] = useState("");
  const [value, setValue] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCovenants().then((r) =>
      r.ok && r.json().then((data) => {
        setCovenants(data.filter((c) => c.operator && c.threshold));
      })
    );
  }, []);

  async function handleCheck(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await checkRisk({
        covenant_id: parseInt(covenantId),
        period,
        reported_value: parseFloat(value),
      });
      if (res.ok) setResult(await res.json());
      else {
        const d = await res.json().catch(() => ({}));
        setError(d.detail || "Check failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pl-10 lg:pl-0">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
          <Shield size={20} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Risk Check</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Check compliance against a covenant
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleCheck}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-4 shadow-card"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Covenant
          </label>
          <select
            value={covenantId}
            onChange={(e) => setCovenantId(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
          >
            <option value="">Select a covenant…</option>
            {covenants.map((c) => (
              <option key={c.id} value={c.id}>
                {c.metric} ({c.operator} {c.threshold}{c.unit || ""})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Reporting Period
          </label>
          <input
            type="date"
            required
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Reported Value
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 3.2"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Checking…</>
          ) : (
            "Run Breach Check"
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl p-4 text-sm flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`mt-5 rounded-2xl border p-5 sm:p-6 shadow-card animate-slide-up ${
            result.status === "compliant"
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {result.status === "compliant" ? (
              <CheckCircle size={28} className="text-green-600 dark:text-green-400" />
            ) : (
              <AlertTriangle size={28} className="text-red-600 dark:text-red-400" />
            )}
            <div>
              <h3
                className={`text-lg font-bold ${
                  result.status === "compliant"
                    ? "text-green-800 dark:text-green-300"
                    : "text-red-800 dark:text-red-300"
                }`}
              >
                {result.status === "compliant" ? "Compliant ✓" : "BREACHED ✗"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{result.covenant}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {[
              { label: "Threshold", val: result.threshold },
              { label: "Reported", val: result.reported },
              {
                label: "Headroom",
                val: result.headroom,
                color: result.headroom >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400",
              },
            ].map(({ label, val, color }) => (
              <div
                key={label}
                className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 text-center"
              >
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{label}</p>
                <p className={`font-bold text-lg ${color || "text-gray-900 dark:text-white"}`}>
                  {val}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
