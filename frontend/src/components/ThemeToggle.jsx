import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle({ compact = false }) {
  const { dark, toggle } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-brand-600 transition-colors duration-300 flex items-center px-1"
    >
      <div
        className={`w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ${
          dark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {dark ? (
          <Moon size={11} className="text-brand-600" />
        ) : (
          <Sun size={11} className="text-amber-500" />
        )}
      </div>
    </button>
  );
}
