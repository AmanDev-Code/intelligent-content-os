import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/apiClient';
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastUnreadCount = useRef(0);

  // Initialize audio and settings
  useEffect(() => {
    // Simple beep sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const createBeep = () => {
        try {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
          console.warn('Failed to create sound:', error);
        }
      };

      audioRef.current = { play: createBeep } as any;
    } catch (error) {
      audioRef.current = { play: () => {} } as any;
    }

    // Load settings
    try {
      const saved = localStorage.getItem('notificationSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/notifications?page=${page}&limit=20`);
      
      if (response.success) {
        const newNotifications = response.data || [];
        setNotifications(prev => append ? [...prev, ...newNotifications] : newNotifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      if (response.success) {
        const newCount = response.count || 0;
        setUnreadCount(newCount);
        
        // If count increased, show toast and play sound
        if (newCount > lastUnreadCount.current && lastUnreadCount.current >= 0) {
          if (settings.soundEnabled && audioRef.current) {
            audioRef.current.play();
          }
          
          // Fetch latest notifications and update the dropdown
          const latestResponse = await apiClient.get('/notifications?page=1&limit=5');
          if (latestResponse.success && latestResponse.data) {
            const latestNotifications = latestResponse.data;
            
            // Update notifications list with latest
            setNotifications(latestNotifications);
            
            // Show toast for the newest one
            if (latestNotifications[0]) {
              showNotificationToast(latestNotifications[0]);
            }
          }
        }
        
        lastUnreadCount.current = newCount;
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [settings.soundEnabled]);

  // Mark as read
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

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('notificationSettings', JSON.stringify(updated));
  }, [settings]);

  // Play sound
  const playNotificationSound = useCallback(() => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play();
    }
  }, [settings.soundEnabled]);

  // Show toast
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
  }, [markAsRead]);

  // Simple polling every 3 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 3000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

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