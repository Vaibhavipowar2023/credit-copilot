export default function PageHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
            <Icon size={20} className="text-brand-600 dark:text-brand-400" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
