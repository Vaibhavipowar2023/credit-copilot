/**
 * A tiny inline SVG sparkline chart.
 * Accepts an array of numbers and renders a smooth area chart.
 */
export default function SparklineChart({ data = [], color = "#3b82f6", height = 32, width = 80 }) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((val, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + (1 - (val - min) / range) * (height - padding * 2),
  }));

  // Build a smooth SVG path using cardinal spline
  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(" ");

  // Area path (closed at bottom)
  const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
    >
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${color.replace("#", "")})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2" fill={color} />
    </svg>
  );
}
