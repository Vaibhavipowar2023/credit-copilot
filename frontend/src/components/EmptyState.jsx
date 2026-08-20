export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-12 text-center animate-fade-in">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
          <Icon size={28} className="text-gray-300 dark:text-gray-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
