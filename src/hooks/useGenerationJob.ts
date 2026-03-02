import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseGenerationJobOptions {
  jobId: string | null;
  onComplete?: (contentId: string | null) => void;
  onFailed?: (error: string | null) => void;
  onProgress?: (progress: number, stage: string | null) => void;
}

export function useGenerationJob({
  jobId,
  onComplete,
  onFailed,
  onProgress,
}: UseGenerationJobOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbacksRef = useRef({ onComplete, onFailed, onProgress });
  callbacksRef.current = { onComplete, onFailed, onProgress };

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel(`generation-job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generation_jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          const row = payload.new as {
            status: string;
            progress: number;
            current_stage: string | null;
            content_id: string | null;
            error: string | null;
          };

          callbacksRef.current.onProgress?.(row.progress, row.current_stage);

          if (row.status === 'ready') {
            callbacksRef.current.onComplete?.(row.content_id);
          } else if (row.status === 'failed') {
            callbacksRef.current.onFailed?.(row.error);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return unsubscribe;
  }, [jobId, unsubscribe]);

  return { unsubscribe };
}
