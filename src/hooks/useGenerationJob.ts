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

const POLL_INTERVAL_MS = 3000; // Poll every 3 seconds (Realtime should handle updates faster)
const MAX_POLL_TIME_MS = 120000; // Maximum 2 minutes

export function useGenerationJob({
  jobId,
  onComplete,
  onFailed,
  onProgress,
}: UseGenerationJobOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollRef = useRef<number | null>(null);
  const isTerminalRef = useRef(false);
  const lastSnapshotRef = useRef('');
  const callbacksRef = useRef({ onComplete, onFailed, onProgress });
  callbacksRef.current = { onComplete, onFailed, onProgress };

  const cleanup = useCallback(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!jobId) {
      console.log('⏸️ useGenerationJob: No jobId, skipping');
      return;
    }

    console.log('🚀 useGenerationJob: Starting to watch jobId:', jobId);
    isTerminalRef.current = false;
    lastSnapshotRef.current = '';

    const processRow = (row: JobRow) => {
      const snap = `${row.status}|${row.progress}|${row.content_id ?? ''}`;
      if (snap === lastSnapshotRef.current) return;
      lastSnapshotRef.current = snap;

      callbacksRef.current.onProgress?.(row.progress, row.current_stage);

      // Simple: check if content_id exists OR status is ready
      if (row.content_id && !isTerminalRef.current) {
        isTerminalRef.current = true;
        cleanup(); // Stop polling immediately
        callbacksRef.current.onComplete?.(row.content_id);
      } else if (row.status === 'failed') {
        isTerminalRef.current = true;
        cleanup(); // Stop polling immediately
        callbacksRef.current.onFailed?.(row.error);
      }
    };

    const fetchLatest = async () => {
      if (isTerminalRef.current) return;
      
      const { data } = await supabase
        .from('generation_jobs')
        .select('status, progress, current_stage, content_id, error')
        .eq('id', jobId)
        .maybeSingle();
      
      if (data) processRow(data as JobRow);
    };

    // Initial fetch + polling fallback
    void fetchLatest();
    pollRef.current = window.setInterval(fetchLatest, POLL_INTERVAL_MS);

    // Realtime subscription
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
          if (!isTerminalRef.current) {
            processRow(payload.new as JobRow);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return cleanup;
  }, [jobId, cleanup]);

  return { unsubscribe: cleanup };
}