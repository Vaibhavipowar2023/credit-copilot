import { useState, useEffect, useRef } from "react";

export function useAnimatedCounter(end, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);
  const startTime = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    if (end === 0 || end == null) {
      setValue(0);
      return;
    }

    startTime.current = performance.now();

    function animate(now) {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    }

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [end, duration]);

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value);
}
