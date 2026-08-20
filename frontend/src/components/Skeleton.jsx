export function SkeletonLine({ width = "w-full", height = "h-4" }) {
  return <div className={`skeleton rounded ${width} ${height}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonLine width="w-32" height="h-5" />
        <SkeletonLine width="w-20" height="h-6" />
      </div>
      <SkeletonLine width="w-48" height="h-3" />
      <SkeletonLine width="w-64" height="h-3" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <SkeletonLine width="w-24" height="h-3" />
          <SkeletonLine width="w-16" height="h-8" />
          <SkeletonLine width="w-32" height="h-3" />
        </div>
        <div className="skeleton w-11 h-11 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50 dark:border-gray-700/50 flex gap-6">
        <SkeletonLine width="w-32" height="h-3" />
        <SkeletonLine width="w-24" height="h-3" />
        <SkeletonLine width="w-20" height="h-3" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-5 py-4 border-b border-gray-50 dark:border-gray-700/50 last:border-0 flex gap-6 items-center">
          <SkeletonLine width="w-40" height="h-4" />
          <SkeletonLine width="w-24" height="h-4" />
          <SkeletonLine width="w-20" height="h-6" />
        </div>
      ))}
    </div>
  );
}
