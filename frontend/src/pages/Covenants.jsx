import { useState, useEffect } from "react";
import { getCovenants } from "../lib/api";
import { FileText, Loader2, Search } from "lucide-react";

export default function Covenants() {
  const [covenants, setCovenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    getCovenants().then((r) =>
      r.ok && r.json().then((data) => { setCovenants(data); setLoading(false); })
    );
  }, []);

  const filtered = covenants.filter(
    (c) =>
      c.metric.toLowerCase().includes(filter.toLowerCase()) ||
      (c.source_quote || "").toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" /> Loading covenants…
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 pl-10 lg:pl-0">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
            <FileText size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Covenants</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {covenants.length} covenant{covenants.length !== 1 ? "s" : ""} in the register
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      {covenants.length > 0 && (
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter covenants…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
      )}

      {covenants.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">
            No covenants yet. Upload a credit agreement to extract them automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 hover:shadow-md transition shadow-card card-3d"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{c.metric}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Loan <span className="font-mono">#{c.loan_agreement_id}</span>
                  </p>
                </div>
                {c.operator ? (
                  <span className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full shrink-0">
                    {c.operator} {c.threshold}
                    {c.unit || ""}
                  </span>
                ) : (
                  <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-3 py-1 rounded-full shrink-0">
                    Non-numeric
                  </span>
                )}
              </div>
              {c.source_quote && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 leading-relaxed line-clamp-2 italic">
                  "{c.source_quote}"
                </p>
              )}
            </div>
          ))}
          {filtered.length === 0 && filter && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
              No covenants match "{filter}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}
