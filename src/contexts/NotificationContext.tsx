import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { API_CONFIG } from '@/lib/constants';
import { toast } from 'sonner';
import { Bell, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface NotificationData {
  contentId?: string;
  jobId?: string;
  credits?: number;
  scheduledFor?: string;
  postId?: string;
  error?: string;
  [key: string]: any;
}

interface Notification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  category: 'publishing' | 'generation' | 'scheduling' | 'system' | 'credits' | 'marketing' | 'announcement';
  data: NotificationData;
  read: boolean;
  is_broadcast: boolean;
  priority: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

interface NotificationSettings {
  soundEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  marketingEnabled: boolean;
  updatesEnabled: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  loading: boolean;
  fetchNotifications: (page?: number, append?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  playNotificationSound: () => void;
  showNotificationToast: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    soundEnabled: true,
    emailEnabled: true,
    pushEnabled: false,
    marketingEnabled: true,
    updatesEnabled: true,
  });

  const { session } = useAuth();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sseAbortRef = useRef<AbortController | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const sseAuthFailedRef = useRef(false);
  const initialLoadDone = useRef(false);
  const seenNotificationIds = useRef<Set<string>>(new Set());
  const sseReconnectAttemptsRef = useRef(0);
  const sseMountedRef = useRef(false);
  // Verbose SSE logging is opt-in via NEXT_PUBLIC_DEBUG_SSE=1 to keep the
  // production console quiet during long generations (carousel runs emit 10–20 events).
  const DEBUG_SSE = process.env.NEXT_PUBLIC_DEBUG_SSE === '1';

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch { /* audio not supported */ }
    }
    return audioContextRef.current;
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('notificationSettings');
      if (saved) setSettings(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const playSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || !settings.soundEnabled) return;
    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.25);
    } catch { /* ignore audio errors */ }
  }, [getAudioContext, settings.soundEnabled]);

  const showNotificationToast = useCallback((notification: Notification) => {
    const getIcon = (type: string) => {
      switch (type) {
        case 'success': return CheckCircle;
        case 'error': return XCircle;
        case 'warning': return AlertTriangle;
        default: return Info;
      }
    };

    const Icon = getIcon(notification.type);

    toast.custom((t) => (
      <div className="flex gap-3 p-4 bg-background border rounded-lg shadow-lg w-80 min-h-[80px]">
        <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
          notification.type === 'success' ? 'text-green-500' :
          notification.type === 'error' ? 'text-red-500' :
          notification.type === 'warning' ? 'text-yellow-500' :
          'text-blue-500'
        }`} />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1 leading-tight">{notification.title}</h4>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed break-words">
            {notification.message}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">just now</span>
            <button
              onClick={() => {
                toast.dismiss(t);
                markAsRead(notification.id);
              }}
              className="text-primary hover:text-primary/80 p-1 rounded-full hover:bg-primary/10 flex-shrink-0"
              title="Mark as read"
            >
              <CheckCircle className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-right',
    });
  }, []);

  const fetchNotifications = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/notifications?page=${page}&limit=20`);
      if (response.success) {
        const newNotifications = response.data || [];
        setNotifications(prev => append ? [...prev, ...newNotifications] : newNotifications);
        newNotifications.forEach((n: Notification) => seenNotificationIds.current.add(n.id));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      if (response.success) {
        setUnreadCount(response.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('notificationSettings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const playNotificationSound = useCallback(() => {
    playSound();
  }, [playSound]);

  const handleRealtimeNotification = useCallback((notification: Notification) => {
    if (seenNotificationIds.current.has(notification.id)) return;
    seenNotificationIds.current.add(notification.id);

    setUnreadCount(prev => prev + 1);
    setNotifications(prev => [notification, ...prev].slice(0, 50));
    playSound();
    showNotificationToast(notification);
  }, [playSound, showNotificationToast]);

  // Stable ref to the realtime handler so the SSE effect below depends ONLY on
  // the auth token. Without this, mutating notification settings (e.g. toggling
  // sound) recreates `playSound` → `handleRealtimeNotification` → forces a full
  // SSE reconnect, leaving the previous backend connection lingering until its
  // socket close is detected. That manifested as duplicate "Sending notification
  // to N client(s)" log lines and double-fired toasts.
  const realtimeHandlerRef = useRef(handleRealtimeNotification);
  useEffect(() => {
    realtimeHandlerRef.current = handleRealtimeNotification;
  }, [handleRealtimeNotification]);

  // SSE connection
  useEffect(() => {
    if (!session?.access_token) return;

    sseMountedRef.current = true;
    initialLoadDone.current = false;
    seenNotificationIds.current.clear();
    sseAuthFailedRef.current = false;
    sseReconnectAttemptsRef.current = 0;

    const initLoad = async () => {
      try {
        const [countRes, listRes] = await Promise.all([
          apiClient.get('/notifications/unread-count'),
          apiClient.get('/notifications?page=1&limit=20'),
        ]);
        if (countRes.success) setUnreadCount(countRes.count || 0);
        if (listRes.success) {
          const existing = listRes.data || [];
          setNotifications(existing);
          existing.forEach((n: Notification) => seenNotificationIds.current.add(n.id));
        }
      } catch {
        // Initial load failure is non-fatal; SSE will still attach.
      }
      initialLoadDone.current = true;
    };

    initLoad();

    // Jittered exponential backoff: 2s, 4s, 8s, 16s, capped at 30s, with ±25% jitter
    // to prevent thundering-herd reconnects (especially common behind ngrok where
    // ERR_HTTP2_PROTOCOL_ERROR storms can drop many tabs simultaneously).
    const computeBackoffMs = (attempt: number): number => {
      const base = Math.min(30000, 2000 * Math.pow(2, Math.max(0, attempt)));
      const jitter = base * 0.25 * (Math.random() * 2 - 1);
      return Math.max(1000, Math.round(base + jitter));
    };

    const scheduleReconnect = (delay: number) => {
      if (!sseMountedRef.current) return;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      reconnectTimer.current = setTimeout(() => {
        if (!sseMountedRef.current) return;
        connect();
      }, delay);
    };

    const connect = () => {
      if (!sseMountedRef.current) return;
      const baseUrl = API_CONFIG.BASE_URL;
      const url = `${baseUrl}/notifications/stream`;

      // Abort any prior in-flight request before opening a new one. Critical for
      // React StrictMode (dev) where the effect mounts → cleanup → re-mounts in
      // quick succession; without this guard a stale fetch's reader could keep a
      // backend SSE client alive after the cleanup ran, causing duplicate
      // notifications.
      if (sseAbortRef.current) {
        try { sseAbortRef.current.abort(); } catch { /* noop */ }
      }
      const controller = new AbortController();
      sseAbortRef.current = controller;

      if (DEBUG_SSE) console.log('[SSE] Connecting to:', url);
      fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Accept': 'text/event-stream',
          'ngrok-skip-browser-warning': 'true',
        },
        signal: controller.signal,
      }).then(async (response) => {
        if (!response.ok || !response.body) {
          throw new Error(`SSE failed: ${response.status}`);
        }
        // Successful open — reset backoff so the next disconnect retries quickly.
        sseReconnectAttemptsRef.current = 0;
        if (DEBUG_SSE) console.log('[SSE] Connection established');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let eventType = 'message';
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              if (!initialLoadDone.current) {
                continue;
              }
              try {
                const data = JSON.parse(line.slice(6));
                if (DEBUG_SSE) {
                  console.log(`[SSE] event=${eventType}`, data?.subtaskKey || data?.id || '');
                }
                if (eventType === 'notification' && data?.id) {
                  realtimeHandlerRef.current(data);
                } else if (eventType === 'credits.balance_changed') {
                  window.dispatchEvent(
                    new CustomEvent('trndinn:credits-updated', { detail: data }),
                  );
                } else if (eventType === 'generation.progress') {
                  window.dispatchEvent(
                    new CustomEvent('trndinn:generation-progress', { detail: data }),
                  );
                } else if (eventType === 'generation.completed') {
                  window.dispatchEvent(
                    new CustomEvent('trndinn:generation-completed', { detail: data }),
                  );
                } else if (eventType === 'generation.image_regenerated') {
                  // Fan out to ScheduleModal (and any other open preview)
                  // so it can swap the regenerated image in place without
                  // needing to refetch the whole content row.
                  window.dispatchEvent(
                    new CustomEvent('trndinn:image-regenerated', { detail: data }),
                  );
                } else if (eventType === 'generation.carousel_regenerated') {
                  window.dispatchEvent(
                    new CustomEvent('trndinn:carousel-regenerated', { detail: data }),
                  );
                }
              } catch {
                // heartbeat (`: heartbeat`) or non-JSON line — no-op.
              }
              eventType = 'message';
            } else if (line === '') {
              eventType = 'message';
            }
          }
        }
        // Stream ended cleanly — server closed the connection. Reconnect with backoff.
        if (!controller.signal.aborted && !sseAuthFailedRef.current && sseMountedRef.current) {
          const delay = computeBackoffMs(sseReconnectAttemptsRef.current++);
          if (DEBUG_SSE) console.log(`[SSE] stream ended; reconnecting in ${delay}ms`);
          scheduleReconnect(delay);
        }
      }).catch((err) => {
        if (err?.name === 'AbortError') return;
        if (!sseMountedRef.current) return;
        if (String(err?.message || '').includes('SSE failed: 401')) {
          sseAuthFailedRef.current = true;
          console.warn('SSE stopped: unauthorized (401). Waiting for fresh session token.');
          return;
        }
        if (sseAuthFailedRef.current) return;
        const delay = computeBackoffMs(sseReconnectAttemptsRef.current++);
        if (DEBUG_SSE) {
          console.warn(`[SSE] connection lost (${err?.message || 'error'}); retry in ${delay}ms`);
        }
        scheduleReconnect(delay);
      });
    };

    connect();

    return () => {
      sseMountedRef.current = false;
      if (sseAbortRef.current) {
        try { sseAbortRef.current.abort(); } catch { /* noop */ }
        sseAbortRef.current = null;
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = undefined;
      }
    };
  }, [session?.access_token, DEBUG_SSE]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    settings,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    updateSettings,
    playNotificationSound,
    showNotificationToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
