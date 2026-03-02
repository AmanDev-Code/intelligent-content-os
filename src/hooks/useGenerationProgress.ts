import { useState, useEffect, useCallback, useRef } from 'react';
import { GENERATION_STAGES, type GenerationStage } from '@/types/content';

interface GenerationProgress {
  progress: number;
  stage: GenerationStage;
  isComplete: boolean;
}

export function useGenerationProgress(isGenerating: boolean) {
  const [state, setState] = useState<GenerationProgress>({
    progress: 0,
    stage: GENERATION_STAGES[0],
    isComplete: false,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setState({ progress: 0, stage: GENERATION_STAGES[0], isComplete: false });
  }, []);

  const complete = useCallback(() => {
    setState({ progress: 100, stage: GENERATION_STAGES[GENERATION_STAGES.length - 1], isComplete: true });
  }, []);

  useEffect(() => {
    if (!isGenerating) return;
    reset();

    const tick = () => {
      setState((prev) => {
        if (prev.isComplete) return prev;

        let increment: number;
        let delay: number;

        if (prev.progress < 20) {
          increment = Math.random() * 5 + 3;
          delay = 300 + Math.random() * 200;
        } else if (prev.progress < 40) {
          increment = Math.random() * 4 + 2;
          delay = 500 + Math.random() * 300;
        } else if (prev.progress < 70) {
          increment = Math.random() * 3 + 1;
          delay = 800 + Math.random() * 500;
        } else {
          increment = Math.random() * 2 + 0.5;
          delay = 1200 + Math.random() * 800;
        }

        const newProgress = Math.min(prev.progress + increment, 92);
        const stageIndex = Math.min(
          Math.floor((newProgress / 100) * GENERATION_STAGES.length),
          GENERATION_STAGES.length - 1
        );

        timerRef.current = setTimeout(tick, delay);
        return {
          progress: newProgress,
          stage: GENERATION_STAGES[stageIndex],
          isComplete: false,
        };
      });
    };

    timerRef.current = setTimeout(tick, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isGenerating, reset]);

  return { ...state, complete, reset };
}
