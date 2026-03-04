import { useState, useRef, useCallback, useEffect } from 'react';

const INCREMENT_INTERVAL_MS = 80;

export function useSmoothProgress() {
  const [displayProgress, setDisplayProgress] = useState(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const activeRef = useRef(false);

  const tick = useCallback((now: number) => {
    if (!activeRef.current) return;

    const elapsed = now - lastTickRef.current;
    if (elapsed >= INCREMENT_INTERVAL_MS) {
      lastTickRef.current = now;
      setDisplayProgress((prev) => {
        const target = targetRef.current;
        if (target >= 100) return 100;
        if (prev < target) return Math.min(prev + 1, target);
        return prev;
      });
    }

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
