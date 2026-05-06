import { useState, useEffect, useCallback } from 'react';

const LS_KEY = 'linkedin-connecting';
const EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface StoredConnectingState {
  timestamp: number;
}

export function useLinkedInConnectionStatus() {
  const [isConnecting, setIsConnecting] = useState(false);

  // On mount, check if there's a non-expired connecting flag
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const parsed: StoredConnectingState = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < EXPIRY_MS) {
        setIsConnecting(true);
      } else {
        // Expired — clear it to prevent stuck state
        localStorage.removeItem(LS_KEY);
      }
    } catch {
      localStorage.removeItem(LS_KEY);
    }
  }, []);

  const startConnecting = useCallback(() => {
    const state: StoredConnectingState = { timestamp: Date.now() };
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    setIsConnecting(true);
  }, []);

  const clearConnecting = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setIsConnecting(false);
  }, []);

  return { isConnecting, startConnecting, clearConnecting };
}
