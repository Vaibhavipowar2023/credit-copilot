import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = "blue" }) {
  const colorMap = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", ring: "ring-blue-100" },
    green: { bg: "bg-green-50", icon: "text-green-600", ring: "ring-green-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", ring: "ring-amber-100" },
    red: { bg: "bg-red-50", icon: "text-red-600", ring: "ring-red-100" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", ring: "ring-purple-100" },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              {trend === "up" && <TrendingUp size={12} className="text-green-500" />}
              {trend === "down" && <TrendingDown size={12} className="text-red-500" />}
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center shrink-0`}>
            <Icon size={20} className={c.icon} />
          </div>
        )}
      </div>
    </div>
  );
}
