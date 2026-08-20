import { useState, useEffect } from "react";
import { getLoans, createLoan, getBorrowers } from "../lib/api";
import { Scale, Plus, X, Banknote } from "lucide-react";

export default function Loans() {
  const [items, setItems] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [borrowerId, setBorrowerId] = useState("");
  const [principal, setPrincipal] = useState("");
  const [currency, setCurrency] = useState("USD");

  const load = () => getLoans().then((r) => r.ok && r.json().then(setItems));
  useEffect(() => {
    load();
    getBorrowers().then((r) => r.ok && r.json().then(setBorrowers));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    const res = await createLoan({
      borrower_id: parseInt(borrowerId),
      principal: parseFloat(principal),
      currency,
    });
    if (res.ok) { setBorrowerId(""); setPrincipal(""); setShowForm(false); load(); }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 pl-10 lg:pl-0">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
            <Scale size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Loans</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {items.length} loan{items.length !== 1 ? "s" : ""} active
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm self-start sm:self-auto"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "Add Loan"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6 space-y-4 shadow-card animate-slide-up"
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Loan</h3>
          <select
            value={borrowerId}
            onChange={(e) => setBorrowerId(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="">Select borrower…</option>
            {borrowers.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              placeholder="Principal amount"
              required
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <input
              placeholder="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full sm:w-28 px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
          >
            Save Loan
          </button>
        </form>
      )}

      {/* Loan list */}
      {items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Banknote size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">No loans yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((l) => (
            <div
              key={l.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition shadow-card card-3d"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                    <Scale size={14} className="text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">#{l.id}</span>
                </div>
                <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-medium">
                  {l.currency}
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {l.principal.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Borrower #{l.borrower_id}
                {l.maturity_date && <> · Matures {l.maturity_date}</>}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
