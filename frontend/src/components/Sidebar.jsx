import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  MessageSquare, CloudUpload, Shield, Users, FileText, Scale,
  LogOut, Menu, X, LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const links = [
  { to: "/",          label: "Dashboard",         icon: LayoutDashboard },
  { to: "/chat",      label: "Ask Copilot",       icon: MessageSquare },
  { to: "/upload",    label: "Documents",          icon: CloudUpload },
  { to: "/covenants", label: "Covenants",          icon: FileText },
  { to: "/risk",      label: "Risk Check",         icon: Shield },
  { to: "/borrowers", label: "Borrowers",          icon: Users },
  { to: "/loans",     label: "Loans",              icon: Scale },
];

export default function Sidebar() {
  const { onLogout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 bg-brand-900 text-white p-2 rounded-lg shadow-lg"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-brand-900 text-white flex flex-col min-h-screen
          transform transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold leading-tight">Credit & Covenant</h1>
            <p className="text-xs text-blue-200 mt-1">Risk Copilot</p>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-blue-200 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-white/15 text-white font-medium"
                    : "text-blue-100 hover:bg-white/10"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-100 hover:bg-white/10 w-full transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
