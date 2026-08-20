import { useState, useEffect } from "react";

/**
 * Animated SVG circular gauge for risk/compliance visualization.
 * - Compliant: green arc fills proportional to headroom
 * - Breached: red arc
 */
export default function RiskGauge({ status, headroom, threshold, reported }) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const isCompliant = status === "compliant";
  const maxHeadroom = Math.abs(threshold) || 1;
  const ratio = Math.min(Math.abs(headroom) / maxHeadroom, 1);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const duration = 1000;

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedProgress(eased * ratio);
      if (progress < 1) raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [ratio]);

  const size = 180;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75; // 270 degree arc
  const offset = arc - arc * animatedProgress;

  const startAngle = 135; // start at bottom-left

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-[0deg]">
          {/* Background arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-gray-100 dark:text-gray-700"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circumference}`}
            strokeDashoffset={0}
            transform={`rotate(${startAngle} ${center} ${center})`}
          />
          {/* Foreground arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={isCompliant ? "#22c55e" : "#ef4444"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circumference}`}
            strokeDashoffset={offset}
            transform={`rotate(${startAngle} ${center} ${center})`}
            className="transition-all duration-1000"
            style={{
              filter: `drop-shadow(0 0 6px ${isCompliant ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-3xl font-bold tabular-nums ${isCompliant ? "text-green-600" : "text-red-600"}`}>
            {reported}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">reported</div>
        </div>
      </div>

      {/* Labels at gauge ends */}
      <div className="flex items-center justify-between w-full max-w-[180px] -mt-2 px-2">
        <span className="text-[10px] text-gray-400 dark:text-gray-500">0</span>
        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
          threshold: {threshold}
        </span>
      </div>
    </div>
  );
}
