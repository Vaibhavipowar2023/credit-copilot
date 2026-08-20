import { useState, useEffect } from "react";
import { getBorrowers, createBorrower } from "../lib/api";
import { Users, Plus, X, Building2 } from "lucide-react";

export default function Borrowers() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");

  const load = () => getBorrowers().then((r) => r.ok && r.json().then(setItems));
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    const res = await createBorrower({ name, sector: sector || null });
    if (res.ok) { setName(""); setSector(""); setShowForm(false); load(); }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 pl-10 lg:pl-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Users size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Borrowers</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {items.length} borrower{items.length !== 1 ? "s" : ""} in portfolio
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm self-start sm:self-auto"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "Add Borrower"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-card animate-slide-up"
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">New Borrower</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              placeholder="Company name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <input
              placeholder="Sector (optional)"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Borrower list */}
      {items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Building2 size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">No borrowers yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between hover:shadow-md transition shadow-card card-3d"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Users size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 truncate">{b.name}</h3>
                  {b.sector && (
                    <span className="inline-block text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full mt-1">
                      {b.sector}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono shrink-0 ml-2">#{b.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
