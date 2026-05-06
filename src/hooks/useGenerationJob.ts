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

const POLL_INTERVAL_MS = 3000;
// Hard ceiling so we never hang forever (carousel generations can take 4–6 min).
const HARD_TIMEOUT_MS = 600000; // 10 minutes
// Heartbeat: if we receive no progress signal for this long, consider the job stalled.
// Most steps (slide render + MinIO upload) finish well under this window.
const STALL_TIMEOUT_MS = 90000; // 90 seconds without any progress signal

export function useGenerationJob({
  jobId,
  onComplete,
  onFailed,
  onProgress,
}: UseGenerationJobOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollRef = useRef<number | null>(null);
  const hardTimeoutRef = useRef<number | null>(null);
  const stallTimeoutRef = useRef<number | null>(null);
  const isTerminalRef = useRef(false);
  const lastSnapshotRef = useRef('');
  const lastProgressAtRef = useRef<number>(0);
  const callbacksRef = useRef({ onComplete, onFailed, onProgress });
  callbacksRef.current = { onComplete, onFailed, onProgress };

  const cleanup = useCallback(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (hardTimeoutRef.current) {
      window.clearTimeout(hardTimeoutRef.current);
      hardTimeoutRef.current = null;
    }
    if (stallTimeoutRef.current) {
      window.clearTimeout(stallTimeoutRef.current);
      stallTimeoutRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    isTerminalRef.current = false;
    lastSnapshotRef.current = '';
    lastProgressAtRef.current = Date.now();

    // Heartbeat-based stall detection: reset every time progress is observed.
    const armStallTimer = () => {
      if (stallTimeoutRef.current) {
        window.clearTimeout(stallTimeoutRef.current);
      }
      stallTimeoutRef.current = window.setTimeout(() => {
        if (isTerminalRef.current) return;
        // Listen one more time for SSE side-channel updates before surrendering.
        const sinceLast = Date.now() - lastProgressAtRef.current;
        if (sinceLast < STALL_TIMEOUT_MS) {
          armStallTimer();
          return;
        }
        isTerminalRef.current = true;
        cleanup();
        callbacksRef.current.onFailed?.(
          'Generation appears stalled (no progress for 90s). Please retry.',
        );
      }, STALL_TIMEOUT_MS);
    };

    const noteProgress = () => {
      lastProgressAtRef.current = Date.now();
      armStallTimer();
    };

    const processRow = (row: JobRow) => {
      const snap = `${row.status}|${row.progress}|${row.content_id ?? ''}`;
      if (snap === lastSnapshotRef.current) return;
      lastSnapshotRef.current = snap;
      noteProgress();

      callbacksRef.current.onProgress?.(row.progress, row.current_stage);

      if (row.content_id && !isTerminalRef.current) {
        isTerminalRef.current = true;
        cleanup();
        callbacksRef.current.onComplete?.(row.content_id);
      } else if (row.status === 'failed') {
        isTerminalRef.current = true;
        cleanup();
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

    void fetchLatest();
    pollRef.current = window.setInterval(fetchLatest, POLL_INTERVAL_MS);

    // SSE pings the same window — treat any progress event for our job as a heartbeat
    // so the stall detector doesn't trip while slides are actively rendering.
    const sseHeartbeat = (e: Event) => {
      const detail = (e as CustomEvent).detail as { generationId?: string } | undefined;
      if (detail?.generationId === jobId) noteProgress();
    };
    window.addEventListener('trndinn:generation-progress', sseHeartbeat);
    window.addEventListener('trndinn:generation-completed', sseHeartbeat);

    armStallTimer();
    hardTimeoutRef.current = window.setTimeout(() => {
      if (isTerminalRef.current) return;
      isTerminalRef.current = true;
      cleanup();
      callbacksRef.current.onFailed?.(
        'Generation timeout: maximum duration exceeded (10 minutes). Please retry.',
      );
    }, HARD_TIMEOUT_MS);

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

    return () => {
      window.removeEventListener('trndinn:generation-progress', sseHeartbeat);
      window.removeEventListener('trndinn:generation-completed', sseHeartbeat);
      cleanup();
    };
  }, [jobId, cleanup]);

  return { unsubscribe: cleanup };
}
