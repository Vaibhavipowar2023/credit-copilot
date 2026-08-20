import { useState, useEffect, useCallback } from "react";
import {
  Upload as UploadIcon, Loader2, CheckCircle, AlertCircle,
  FileText, CloudUpload, X, Clock, Hash, Database,
  FileSearch, SplitSquareVertical, Binary, HardDrive, BookOpen,
  Circle, Check,
} from "lucide-react";
import { uploadDocument, getLoans, extractCovenants, getDocuments } from "../lib/api";

const TABS = [
  { key: "upload",  label: "Upload",           icon: CloudUpload },
  { key: "history", label: "Document History",  icon: Database },
];

export default function Upload() {
  const [tab, setTab] = useState("upload");
  const [historyKey, setHistoryKey] = useState(0);

  function switchToHistory() {
    setHistoryKey(k => k + 1);
    setTab("history");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pl-10 lg:pl-0">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
          <CloudUpload size={20} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Documents</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload agreements & view document history
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); if (key === "history") setHistoryKey(k => k + 1); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              tab === key
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === "upload" ? <UploadTab onUploaded={switchToHistory} /> : <HistoryTab key={historyKey} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Pipeline Steps Config
   ═══════════════════════════════════════════════════ */
const PIPELINE_STEPS = [
  { key: "uploading",   label: "Uploading PDF",        icon: CloudUpload,           desc: "Sending file to server..." },
  { key: "parsing",     label: "Parsing Document",     icon: FileSearch,            desc: "Extracting text from PDF..." },
  { key: "chunking",    label: "Creating Chunks",      icon: SplitSquareVertical,   desc: "Splitting into sections..." },
  { key: "embedding",   label: "Generating Embeddings", icon: Binary,               desc: "Creating vector embeddings..." },
  { key: "storing",     label: "Storing in Database",  icon: HardDrive,             desc: "Saving chunks & vectors..." },
  { key: "extracting",  label: "Extracting Covenants", icon: BookOpen,              desc: "AI finding covenants..." },
];

/* ═══════════════════════════════════════════════════
   Step Indicator Component
   ═══════════════════════════════════════════════════ */
function StepIndicator({ steps, currentStep, error }) {
  const currentIdx = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 shadow-card">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Processing Pipeline</h3>
      <div className="space-y-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          let status = "pending";  // pending | active | done | error
          if (error && idx === currentIdx) status = "error";
          else if (idx < currentIdx) status = "done";
          else if (idx === currentIdx) status = "active";

          return (
            <div key={step.key} className="flex items-start gap-3 relative">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className={`absolute left-[15px] top-[30px] w-0.5 h-[calc(100%)] ${
                  status === "done" ? "bg-green-400 dark:bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                }`} />
              )}

              {/* Status icon */}
              <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                status === "done"
                  ? "bg-green-100 dark:bg-green-900/40"
                  : status === "active"
                  ? "bg-brand-100 dark:bg-brand-900/40 ring-2 ring-brand-400 dark:ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800"
                  : status === "error"
                  ? "bg-red-100 dark:bg-red-900/40"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}>
                {status === "done" ? (
                  <Check size={14} className="text-green-600 dark:text-green-400" />
                ) : status === "active" ? (
                  <Loader2 size={14} className="text-brand-600 dark:text-brand-400 animate-spin" />
                ) : status === "error" ? (
                  <X size={14} className="text-red-600 dark:text-red-400" />
                ) : (
                  <Circle size={10} className="text-gray-400 dark:text-gray-500" />
                )}
              </div>

              {/* Label */}
              <div className="pb-4 min-w-0">
                <p className={`text-sm font-medium ${
                  status === "done"
                    ? "text-green-700 dark:text-green-400"
                    : status === "active"
                    ? "text-brand-700 dark:text-brand-400"
                    : status === "error"
                    ? "text-red-700 dark:text-red-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}>
                  {step.label}
                  {status === "done" && <span className="ml-1.5 text-xs text-green-500">✓</span>}
                </p>
                {status === "active" && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 animate-pulse">
                    {step.desc}
                  </p>
                )}
                {status === "error" && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">Failed</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Upload Tab
   ═══════════════════════════════════════════════════ */
function UploadTab({ onUploaded }) {
  const [loans, setLoans] = useState([]);
  const [loanId, setLoanId] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | parsing | chunking | embedding | storing | extracting | done | error
  const [currentStep, setCurrentStep] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getLoans()
      .then((r) => {
        if (r.ok) return r.json().then((data) => { console.log("[Upload] Loaded loans:", data.length); setLoans(data); });
        console.warn("[Upload] Failed to load loans:", r.status);
      })
      .catch((err) => console.error("[Upload] Error loading loans:", err));
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") setFile(dropped);
  }

  // Simulate step progression for the upload call
  // (The backend does parse→chunk→embed→store in one call,
  //  so we show estimated timing for each phase)
  function simulateSteps(stepKeys, doneCallback) {
    let idx = 0;
    const timings = {
      uploading: 1500,
      parsing: 3000,
      chunking: 2000,
      embedding: 4000,
      storing: 2000,
    };

    function next() {
      if (idx >= stepKeys.length) {
        if (doneCallback) doneCallback();
        return;
      }
      const step = stepKeys[idx];
      setCurrentStep(step);
      setStatus(step);
      idx++;
    }

    next(); // start first step
    return { next, timings };
  }

  async function handleUpload(e) {
    e.preventDefault();
    console.log("[Upload] handleUpload fired", { loanId, file: file?.name, fileSize: file?.size });
    if (!loanId || !file) {
      console.warn("[Upload] Aborted: loanId or file missing", { loanId, hasFile: !!file });
      return;
    }

    setError("");
    setToast(null);
    setResult(null);
    const uploadedFileName = file.name;

    // Start pipeline steps
    const uploadSteps = ["uploading", "parsing", "chunking", "embedding", "storing"];
    let stepIdx = 0;

    // Step 1: uploading
    setCurrentStep("uploading");
    setStatus("uploading");

    try {
      // Start the upload call - while it runs, simulate step progression
      const uploadPromise = uploadDocument(loanId, file);

      // Advance steps on a timer while we wait for the API
      const timings = [1200, 2500, 2000, 3000]; // time between steps 1→2, 2→3, etc
      let stepTimer;
      function advanceStep() {
        stepIdx++;
        if (stepIdx < uploadSteps.length) {
          setCurrentStep(uploadSteps[stepIdx]);
          setStatus(uploadSteps[stepIdx]);
          if (stepIdx < uploadSteps.length - 1) {
            stepTimer = setTimeout(advanceStep, timings[stepIdx] || 2000);
          }
        }
      }
      stepTimer = setTimeout(advanceStep, timings[0]);

      const res = await uploadPromise;
      clearTimeout(stepTimer);

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Upload failed");
      }

      const doc = await res.json();

      // Mark all upload steps as done, move to storing
      setCurrentStep("storing");
      setStatus("storing");

      // Brief pause to show "storing" completed
      await new Promise(r => setTimeout(r, 800));

      setToast({ message: `${uploadedFileName} saved successfully!`, type: "success" });

      // Step 6: Extract covenants
      setCurrentStep("extracting");
      setStatus("extracting");

      const extRes = await extractCovenants(doc.id);
      if (extRes.ok) {
        const data = await extRes.json();
        setResult({ ...data, filename: uploadedFileName });
      } else {
        setResult({ document_id: doc.id, extracted_count: 0, filename: uploadedFileName });
      }

      setCurrentStep("done");
      setStatus("done");
    } catch (err) {
      console.error("[Upload] Error during upload:", err);
      setError(err.message || "Unknown error occurred");
      setStatus("error");
    }
  }

  const isWorking = !["idle", "done", "error"].includes(status);
  const showPipeline = isWorking || status === "done" || status === "error";

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up bg-green-600 text-white">
          <CheckCircle size={18} />
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X size={16} /></button>
        </div>
      )}

      {/* Form — hidden during processing */}
      {!showPipeline && (
        <form
          onSubmit={handleUpload}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-5 shadow-card"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Loan Agreement
            </label>
            {loans.length === 0 ? (
              <div className="border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center">
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">No loans found</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                  Create a Borrower and a Loan first, then come back to upload a document.
                </p>
              </div>
            ) : (
              <select
                value={loanId}
                onChange={(e) => setLoanId(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
              >
                <option value="">Select a loan…</option>
                {loans.map((l) => (
                  <option key={l.id} value={l.id}>
                    Loan #{l.id} — {l.currency} {l.principal?.toLocaleString()}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              PDF File
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput").click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-brand-400 dark:hover:border-brand-500"
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2 text-brand-600 dark:text-brand-400">
                  <FileText size={22} />
                  <span className="font-medium text-sm">{file.name}</span>
                  <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(0)} KB)</span>
                </div>
              ) : (
                <div className="text-gray-400 dark:text-gray-500">
                  <UploadIcon size={36} className="mx-auto mb-2" />
                  <p className="text-sm font-medium">Click or drag & drop a PDF</p>
                  <p className="text-xs mt-1">Supports credit agreements in PDF format</p>
                </div>
              )}
            </div>
            <input id="fileInput" type="file" accept=".pdf" className="hidden"
              onChange={(e) => setFile(e.target.files[0])} />
          </div>

          <button
            type="submit"
            disabled={!loanId || !file}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UploadIcon size={16} /> Upload & Process
          </button>
        </form>
      )}

      {/* Pipeline progress */}
      {showPipeline && status !== "done" && (
        <>
          {file && (
            <div className="flex items-center gap-3 mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
              <FileText size={18} className="text-red-500 shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
              <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(0)} KB)</span>
            </div>
          )}
          <StepIndicator steps={PIPELINE_STEPS} currentStep={currentStep} error={status === "error"} />
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Processing failed</p>
                <p className="text-xs mt-1">{error}</p>
              </div>
            </div>
          )}
          {status === "error" && (
            <button
              onClick={() => { setStatus("idle"); setCurrentStep(null); setError(""); setResult(null); }}
              className="mt-3 w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-xl transition text-sm"
            >
              Try Again
            </button>
          )}
        </>
      )}

      {/* Success */}
      {status === "done" && result && (
        <div className="space-y-4 animate-slide-up">
          {/* Completed pipeline (all green) */}
          <StepIndicator steps={PIPELINE_STEPS} currentStep="done" error={false} />

          {/* Result card */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 rounded-2xl p-5 shadow-card">
            <div className="flex items-center gap-2 font-semibold mb-2">
              <CheckCircle size={20} /> All Steps Complete!
            </div>
            <p className="text-sm mb-3">
              <strong>{result.filename}</strong> processed successfully — extracted{" "}
              <strong>{result.extracted_count}</strong> covenant{result.extracted_count !== 1 ? "s" : ""}.
            </p>
            {result.covenants && result.covenants.length > 0 && (
              <ul className="mb-3 space-y-2">
                {result.covenants.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 bg-white/60 dark:bg-gray-800/60 rounded-lg p-2.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-1.5" />
                    <div>
                      <span className="font-medium text-sm">{c.metric}</span>
                      {c.operator ? (
                        <span className="text-green-600 dark:text-green-400 text-sm ml-1.5">
                          {c.operator} {c.threshold}{c.unit || ""}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 italic text-xs ml-1.5">non-numeric</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                onClick={onUploaded}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2"
              >
                <Database size={16} /> View Document History
              </button>
              <button
                onClick={() => { setStatus("idle"); setCurrentStep(null); setResult(null); setFile(null); setError(""); }}
                className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-xl transition text-sm border border-gray-200 dark:border-gray-600 flex items-center justify-center gap-2"
              >
                <UploadIcon size={16} /> Upload Another
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   History Tab
   ═══════════════════════════════════════════════════ */
function HistoryTab() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getDocuments()
      .then((r) => {
        if (r.ok) return r.json().then((data) => { setDocs(data); setLoading(false); });
        setError(true);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
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
      <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading documents…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
        <AlertCircle size={24} className="mx-auto mb-2 text-red-400" />
        <p className="text-sm text-red-600 dark:text-red-400">Failed to load documents. Please try again.</p>
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <FileText size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet.</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload a credit agreement to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
        {docs.length} document{docs.length !== 1 ? "s" : ""} uploaded
      </p>
      {docs.map((doc) => (
        <div
          key={doc.id}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-card hover:shadow-md transition"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-red-500 dark:text-red-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{doc.filename}</h3>
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
  );
}
