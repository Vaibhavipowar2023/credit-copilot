const variants = {
  compliant: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
    ring: "ring-green-500/20 dark:ring-green-500/30",
  },
  breached: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    ring: "ring-red-500/20 dark:ring-red-500/30",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    ring: "ring-amber-500/20 dark:ring-amber-500/30",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
    ring: "ring-blue-500/20 dark:ring-blue-500/30",
  },
  neutral: {
    bg: "bg-gray-50 dark:bg-gray-700",
    text: "text-gray-600 dark:text-gray-300",
    dot: "bg-gray-400",
    ring: "ring-gray-400/20 dark:ring-gray-500/30",
  },
};

export default function StatusBadge({ status, label, size = "sm" }) {
  const v = variants[status] || variants.neutral;
  const sizing = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ring-1 ${v.bg} ${v.text} ${v.ring} ${sizing}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
      {label || status}
    </span>
  );
}
