import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from './AuthContext';

interface LinkedInMetrics {
  followers: number;
  engagement: string;
  posts: number;
  connected: boolean;
  needsReauth?: boolean;
}

interface LinkedInContextType {
  isConnected: boolean;
  metrics: LinkedInMetrics | null;
  loading: boolean;
  needsReauth: boolean;
  refreshConnection: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const LinkedInContext = createContext<LinkedInContextType | undefined>(undefined);

export function LinkedInProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<LinkedInMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);

  const refreshConnection = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const status = await apiClient.get('/linkedin/status');
      setIsConnected(status?.connected || false);
    } catch (error) {
      console.error('Error fetching LinkedIn connection status:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refreshMetrics = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const dashboardMetrics = await apiClient.get('/linkedin/dashboard');
      setMetrics(dashboardMetrics);
      setIsConnected(dashboardMetrics?.connected || false);
      setNeedsReauth(dashboardMetrics?.needsReauth || false);
    } catch (error) {
      console.error('Error fetching LinkedIn metrics:', error);
      setMetrics(null);
      setNeedsReauth(true);
    }
  }, [user?.id]);

  const disconnect = useCallback(async () => {
    if (!user?.id) {
      console.error('No user ID available for disconnect');
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔗 Attempting to disconnect LinkedIn for user:', user.id);
      
      const result = await apiClient.post('/linkedin/disconnect');
      console.log('✅ LinkedIn disconnect successful:', result);
      
      setIsConnected(false);
      setMetrics(null);
      setNeedsReauth(false);
      
      // Trigger localStorage event for other tabs
      localStorage.setItem('linkedin-disconnected', 'true');
      localStorage.removeItem('linkedin-disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting LinkedIn:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      refreshConnection();
      refreshMetrics();
    }
  }, [user?.id, refreshConnection, refreshMetrics]);

  // Listen for storage events (when user connects/disconnects in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'linkedin-connected' && e.newValue === 'true') {
        refreshConnection();
        refreshMetrics();
      } else if (e.key === 'linkedin-disconnected' && e.newValue === 'true') {
        setIsConnected(false);
        setMetrics(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshConnection, refreshMetrics]);

  const value: LinkedInContextType = {
    isConnected,
    metrics,
    loading,
    needsReauth,
    refreshConnection,
    refreshMetrics,
    disconnect,
  };

  return (
    <LinkedInContext.Provider value={value}>
      {children}
    </LinkedInContext.Provider>
  );
}

export function useLinkedIn() {
  const context = useContext(LinkedInContext);
  if (context === undefined) {
    throw new Error('useLinkedIn must be used within a LinkedInProvider');
  }
  return context;
}