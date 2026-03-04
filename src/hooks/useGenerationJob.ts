import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseGenerationJobOptions {
  jobId: string | null;
  onComplete?: (contentId: string | null) => void;
  onFailed?: (error: string | null) => void;
  onProgress?: (progress: number, stage: string | null) => void;
}

type JobRow = {
  status: string;
  progress: number;
  current_stage: string | null;
  content_id: string | null;
  error: string | null;
};

const POLL_INTERVAL_MS = 1500;

export function useGenerationJob({
  jobId,
  onComplete,
  onFailed,
  onProgress,
}: UseGenerationJobOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollRef = useRef<number | null>(null);
  const isTerminalRef = useRef(false);
  const lastSnapshotRef = useRef<string>('');
  const callbacksRef = useRef({ onComplete, onFailed, onProgress });
  callbacksRef.current = { onComplete, onFailed, onProgress };

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const unsubscribe = useCallback(() => {
    stopPolling();

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [stopPolling]);

  const processRow = useCallback((row: JobRow) => {
    const snapshot = `${row.status}|${row.progress}|${row.current_stage ?? ''}|${row.content_id ?? ''}|${row.error ?? ''}`;
    if (snapshot === lastSnapshotRef.current) return;
    lastSnapshotRef.current = snapshot;

    callbacksRef.current.onProgress?.(row.progress, row.current_stage);

    if (row.status === 'ready') {
      isTerminalRef.current = true;
      callbacksRef.current.onComplete?.(row.content_id);
    } else if (row.status === 'failed') {
      isTerminalRef.current = true;
      callbacksRef.current.onFailed?.(row.error);
    }
  }, []);

  const fetchLatest = useCallback(async (currentJobId: string) => {
    const { data } = await supabase
      .from('generation_jobs')
      .select('status, progress, current_stage, content_id, error')
      .eq('id', currentJobId)
      .maybeSingle();

    if (!data || isTerminalRef.current) return;
    processRow(data as JobRow);
  }, [processRow]);

  useEffect(() => {
    if (!jobId) return;

    isTerminalRef.current = false;
    lastSnapshotRef.current = '';

    void fetchLatest(jobId);

    pollRef.current = window.setInterval(() => {
      if (!isTerminalRef.current) {
        void fetchLatest(jobId);
      }
    }, POLL_INTERVAL_MS);

    const createChannel = () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      channelRef.current = supabase
        .channel(`generation-job-${jobId}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'generation_jobs',
            filter: `id=eq.${jobId}`,
          },
          (payload) => {
            if (!isTerminalRef.current) {
              processRow(payload.new as JobRow);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            // Realtime can flap in browser sessions; polling keeps UI synced anyway.
            // Try to resubscribe, but keep a single channel alive.
            createChannel();
          }
        });
    };

    createChannel();

    return unsubscribe;
  }, [jobId, unsubscribe, fetchLatest, processRow]);

  return { unsubscribe };
}
