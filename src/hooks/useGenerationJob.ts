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

  const processRow = useCallback((row: {
    status: string;
    progress: number;
    current_stage: string | null;
    content_id: string | null;
    error: string | null;
  }) => {
    console.log('[useGenerationJob] Row update:', row.status, row.progress, row.current_stage);
    callbacksRef.current.onProgress?.(row.progress, row.current_stage);

    if (row.status === 'ready') {
      callbacksRef.current.onComplete?.(row.content_id);
    } else if (row.status === 'failed') {
      callbacksRef.current.onFailed?.(row.error);
    }
  }, []);

  useEffect(() => {
    if (!jobId) return;

    // Fetch current state immediately to catch updates that happened before subscribing
    const fetchCurrentState = async () => {
      const { data } = await supabase
        .from('generation_jobs')
        .select('status, progress, current_stage, content_id, error')
        .eq('id', jobId)
        .single();

      if (data && (data.progress > 0 || data.status === 'ready' || data.status === 'failed')) {
        console.log('[useGenerationJob] Initial fetch caught state:', data);
        processRow(data);
      }
    };

    fetchCurrentState();

    // Subscribe to realtime updates
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
          processRow(row);
        }
      )
      .subscribe((status) => {
        console.log('[useGenerationJob] Channel status:', status);
      });

    channelRef.current = channel;

    return unsubscribe;
  }, [jobId, unsubscribe, processRow]);

  return { unsubscribe };
}
