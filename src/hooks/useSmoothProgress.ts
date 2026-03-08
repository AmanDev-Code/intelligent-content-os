import { useState, useRef, useCallback, useEffect } from 'react';

const FAST_INTERVAL_MS = 100;   // speed when catching up to target
const SLOW_INTERVAL_MS = 800;   // speed when drifting past target (waiting for next update)
const MAX_DRIFT = 98;           // never drift past 98% without backend confirmation

export function useSmoothProgress() {
  const [displayProgress, setDisplayProgress] = useState(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const activeRef = useRef(false);

  const tick = useCallback((now: number) => {
    if (!activeRef.current) return;

    const target = targetRef.current;

    setDisplayProgress((prev) => {
      if (target >= 100) return 100;

      const isBehind = prev < target;
      const interval = isBehind ? FAST_INTERVAL_MS : SLOW_INTERVAL_MS;
      const elapsed = now - lastTickRef.current;

      if (elapsed < interval) return prev; // not time yet, keep current

      lastTickRef.current = now;

      if (isBehind) {
        // Catching up to backend target — move fast but smoothly
        const increment = target > 80 ? 0.5 : 1; // Slower near completion
        return Math.min(prev + increment, target);
      }

      // Already at or past target — drift slowly, cap at MAX_DRIFT
      if (prev < MAX_DRIFT) {
        const driftIncrement = prev > 90 ? 0.1 : 0.3; // Very slow near end
        return prev + driftIncrement;
      }

      return prev;
    });

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startLoop = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopLoop = useCallback(() => {
    activeRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const setTarget = useCallback((value: number) => {
    targetRef.current = value;
    if (value >= 100) {
      stopLoop();
      setDisplayProgress(100);
    } else if (value <= 0) {
      stopLoop();
      setDisplayProgress(0);
    } else {
      startLoop();
    }
  }, [startLoop, stopLoop]);

  useEffect(() => stopLoop, [stopLoop]);

  return { displayProgress, setTarget };
}