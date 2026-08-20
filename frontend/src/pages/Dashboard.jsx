import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Scale, FileText, Shield, ArrowRight, Upload,
  MessageSquare, CreditCard, Database, Clock, TrendingUp,
} from "lucide-react";
import { getBorrowers, getLoans, getCovenants, getDocuments } from "../lib/api";

function StatCard({ title, value, subtitle, icon: Icon, color, onClick }) {
  const colorMap = {
    blue:   "bg-blue-500",
    green:  "bg-emerald-500",
    purple: "bg-purple-500",
    amber:  "bg-amber-500",
    indigo: "bg-indigo-500",
  };

  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 text-left shadow-card hover:shadow-md transition group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colorMap[color] || colorMap.blue} flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
    </button>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [bRes, lRes, cRes, dRes] = await Promise.all([
          getBorrowers(), getLoans(), getCovenants(), getDocuments(),
        ]);
        const borrowers = bRes.ok ? await bRes.json() : [];
        const loans     = lRes.ok ? await lRes.json() : [];
        const covenants = cRes.ok ? await cRes.json() : [];
        const documents = dRes.ok ? await dRes.json() : [];
        const numericCovenants = covenants.filter(c => c.operator && c.threshold);
        const totalPrincipal = loans.reduce((sum, l) => sum + l.principal, 0);

        setStats({
          borrowers: borrowers.length,
          loans: loans.length,
          covenants: covenants.length,
          documents: documents.length,
          numericCovenants: numericCovenants.length,
          totalPrincipal,
          recentBorrowers: borrowers.slice(-3).reverse(),
          recentLoans: loans.slice(-3).reverse(),
          recentDocs: documents.slice(0, 3),
        });
      } catch {
        setStats({
          borrowers: 0, loans: 0, covenants: 0, documents: 0,
          numericCovenants: 0, totalPrincipal: 0,
          recentBorrowers: [], recentLoans: [], recentDocs: [],
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const quickActions = [
    { label: "Ask Copilot",       desc: "Query agreements with AI", icon: MessageSquare, to: "/chat",   gradient: "from-brand-500 to-indigo-600" },
    { label: "Upload Agreement",  desc: "Parse & extract covenants", icon: Upload,       to: "/upload", gradient: "from-emerald-500 to-teal-600" },
    { label: "Run Risk Check",    desc: "Check covenant compliance", icon: Shield,        to: "/risk",   gradient: "from-amber-500 to-orange-600" },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="mb-8 pl-10 lg:pl-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getGreeting()} 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Here's your credit portfolio overview
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <Clock size={13} />
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard title="Borrowers"  value={stats.borrowers}  icon={Users}    color="blue"   onClick={() => nav("/borrowers")} />
        <StatCard title="Active Loans" value={stats.loans}    icon={Scale}    color="green"
          subtitle={stats.totalPrincipal > 0 ? `$${(stats.totalPrincipal / 1_000_000).toFixed(1)}M total` : null}
          onClick={() => nav("/loans")} />
        <StatCard title="Covenants"  value={stats.covenants}  icon={FileText} color="purple"
          subtitle={`${stats.numericCovenants} checkable`}
          onClick={() => nav("/covenants")} />
        <StatCard title="Documents"  value={stats.documents}  icon={Database} color="indigo"  onClick={() => nav("/upload")} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map(({ label, desc, icon: Icon, to, gradient }) => (
            <button
              key={to}
              onClick={() => nav(to)}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 text-left shadow-card hover:shadow-md transition"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                <Icon size={20} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{label}</h4>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity — 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Documents */}
        <RecentList
          title="Recent Documents"
          items={stats.recentDocs}
          emptyText="No documents yet"
          emptyAction={() => nav("/upload")}
          emptyLabel="Upload one"
          viewAllAction={() => nav("/upload")}
          renderItem={(d) => (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                <FileText size={14} className="text-red-500 dark:text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{d.filename}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Loan #{d.loan_agreement_id}</p>
              </div>
            </div>
          )}
        />

        {/* Recent Borrowers */}
        <RecentList
          title="Recent Borrowers"
          items={stats.recentBorrowers}
          emptyText="No borrowers yet"
          emptyAction={() => nav("/borrowers")}
          emptyLabel="Add one"
          viewAllAction={() => nav("/borrowers")}
          renderItem={(b) => (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Users size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{b.name}</p>
                {b.sector && <p className="text-xs text-gray-400 dark:text-gray-500">{b.sector}</p>}
              </div>
            </div>
          )}
        />

        {/* Recent Loans */}
        <RecentList
          title="Recent Loans"
          items={stats.recentLoans}
          emptyText="No loans yet"
          emptyAction={() => nav("/loans")}
          emptyLabel="Create one"
          viewAllAction={() => nav("/loans")}
          renderItem={(l) => (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <CreditCard size={14} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {l.currency} {l.principal.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Borrower #{l.borrower_id}
                </p>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}

/* ── Reusable recent-list card ── */
function RecentList({ title, items, emptyText, emptyAction, emptyLabel, viewAllAction, renderItem }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{title}</h3>
        {items.length > 0 && (
          <button
            onClick={viewAllAction}
            className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight size={11} />
          </button>
        )}
      </div>
      {items.length > 0 ? (
        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
          {items.map((item, i) => (
            <div key={item.id || i} className="px-4 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition">
              {renderItem(item)}
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          {emptyText}.{" "}
          <button onClick={emptyAction} className="text-brand-600 dark:text-brand-400 hover:underline">
            {emptyLabel}
          </button>
        </div>
      )}
    </div>
  );
}
