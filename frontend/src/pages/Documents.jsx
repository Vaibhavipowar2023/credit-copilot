import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDocuments } from "../lib/api";
import {
  FileText, Loader2, Upload, Clock, Database, Hash,
} from "lucide-react";

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    getDocuments()
      .then((r) => {
        if (r.ok) return r.json().then((data) => { setDocs(data); setLoading(false); });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" /> Loading documents…
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 pl-10 lg:pl-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <Database size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Uploaded Documents
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {docs.length} document{docs.length !== 1 ? "s" : ""} in the system
            </p>
          </div>
        </div>
        <button
          onClick={() => nav("/upload")}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm self-start sm:self-auto"
        >
          <Upload size={16} /> Upload New
        </button>
      </div>

      {/* Document list */}
      {docs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No documents uploaded yet.
          </p>
          <button
            onClick={() => nav("/upload")}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl inline-flex items-center gap-2 transition"
          >
            <Upload size={16} /> Upload Your First Agreement
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-card card-3d hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: file info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-red-500 dark:text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {doc.filename}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock size={11} /> {formatDate(doc.created_at)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Hash size={11} /> Loan #{doc.loan_agreement_id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: badges */}
                <div className="flex items-center gap-2 shrink-0">
                  {doc.chunk_count != null && (
                    <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full font-medium">
                      <Database size={11} /> {doc.chunk_count} chunks
                    </span>
                  )}
                  <span className="inline-flex items-center text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-full font-medium">
                    Processed ✓
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
