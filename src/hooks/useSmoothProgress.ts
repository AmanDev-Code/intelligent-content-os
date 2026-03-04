import { useState, useRef, useCallback, useEffect } from 'react';

const FAST_INTERVAL_MS = 80;   // speed when catching up to target
const SLOW_INTERVAL_MS = 400;  // speed when drifting past target (waiting for next update)
const MAX_DRIFT = 95;          // never drift past 95% without backend confirmation

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
        // Catching up to backend target — move fast
        return Math.min(prev + 1, target);
      }

      // Already at or past target — drift slowly, cap at MAX_DRIFT
      if (prev < MAX_DRIFT) {
        return prev + 0.5;
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
