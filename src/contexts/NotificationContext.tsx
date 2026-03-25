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
  const sseRef = useRef<{ close: () => void } | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const initialLoadDone = useRef(false);
  const seenNotificationIds = useRef<Set<string>>(new Set());

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

  // SSE connection
  useEffect(() => {
    if (!session?.access_token) return;

    initialLoadDone.current = false;
    seenNotificationIds.current.clear();

    // Load existing notifications and count without triggering alerts
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
      } catch { /* ignore */ }
      initialLoadDone.current = true;
    };

    initLoad();

    const connect = () => {
      const baseUrl = API_CONFIG.BASE_URL;
      const url = `${baseUrl}/notifications/stream`;
      const controller = new AbortController();

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
              if (!initialLoadDone.current) continue;
              try {
                const data = JSON.parse(line.slice(6));
                if (eventType === 'notification' && data?.id) {
                  handleRealtimeNotification(data);
                }
              } catch {
                // heartbeat or non-JSON
              }
              eventType = 'message';
            } else if (line === '') {
              eventType = 'message';
            }
          }
        }
      }).catch((err) => {
        if (err.name === 'AbortError') return;
        console.warn('SSE connection lost, reconnecting in 5s...', err.message);
        reconnectTimer.current = setTimeout(connect, 5000);
      });

      sseRef.current = { close: () => controller.abort() };
    };

    connect();

    return () => {
      sseRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [session?.access_token, handleRealtimeNotification]);

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
