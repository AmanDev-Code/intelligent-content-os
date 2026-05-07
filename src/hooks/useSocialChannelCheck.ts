import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

/**
 * Supported social platforms (expand as needed)
 * Currently only LinkedIn is implemented, but the structure supports future platforms.
 */
export type SocialPlatform = 'linkedin' | 'x' | 'youtube' | 'facebook' | 'instagram';

interface SocialChannelStatus {
  isLinkedInConnected: boolean;
  isXConnected: boolean;
  isYouTubeConnected: boolean;
  isFacebookConnected: boolean;
  isInstagramConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseSocialChannelCheckReturn extends SocialChannelStatus {
  checkChannelConnected: (platform: SocialPlatform) => boolean;
  showConnectionRequired: (platform: SocialPlatform, action?: string) => boolean;
  refreshStatus: () => Promise<void>;
}

const PLATFORM_MESSAGES: Record<SocialPlatform, { generate: string; post: string; schedule: string }> = {
  linkedin: {
    generate: 'Please connect your LinkedIn account first to generate content',
    post: 'Connect your LinkedIn account to publish posts',
    schedule: 'Connect your LinkedIn account to schedule posts',
  },
  x: {
    generate: 'Please connect your X account first to generate content',
    post: 'Connect your X account to publish posts',
    schedule: 'Connect your X account to schedule posts',
  },
  youtube: {
    generate: 'Please connect your YouTube account first to generate content',
    post: 'Connect your YouTube account to publish posts',
    schedule: 'Connect your YouTube account to schedule posts',
  },
  facebook: {
    generate: 'Please connect your Facebook account first to generate content',
    post: 'Connect your Facebook account to publish posts',
    schedule: 'Connect your Facebook account to schedule posts',
  },
  instagram: {
    generate: 'Please connect your Instagram account first to generate content',
    post: 'Connect your Instagram account to publish posts',
    schedule: 'Connect your Instagram account to schedule posts',
  },
};

/**
 * Hook to check if required social channels are connected.
 * Currently only LinkedIn is implemented, but the structure supports future platforms.
 */
export function useSocialChannelCheck(): UseSocialChannelCheckReturn {
  const [status, setStatus] = useState<SocialChannelStatus>({
    isLinkedInConnected: false,
    isXConnected: false,
    isYouTubeConnected: false,
    isFacebookConnected: false,
    isInstagramConnected: false,
    isLoading: true,
    error: null,
  });

  const checkLinkedInStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/linkedin/status');
      return response?.connected === true;
    } catch {
      return false;
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const linkedInConnected = await checkLinkedInStatus();
      
      setStatus({
        isLinkedInConnected: linkedInConnected,
        // Future platforms - not yet implemented
        isXConnected: false,
        isYouTubeConnected: false,
        isFacebookConnected: false,
        isInstagramConnected: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check connection status',
      }));
    }
  }, [checkLinkedInStatus]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const checkChannelConnected = useCallback(
    (platform: SocialPlatform): boolean => {
      switch (platform) {
        case 'linkedin':
          return status.isLinkedInConnected;
        // Future platforms - not yet implemented
        // case 'x': return status.isXConnected;
        // case 'youtube': return status.isYouTubeConnected;
        // case 'facebook': return status.isFacebookConnected;
        // case 'instagram': return status.isInstagramConnected;
        default:
          return false;
      }
    },
    [status],
  );

  /**
   * Shows a toast message if the platform is not connected.
   * Returns true if connected (action can proceed), false if not connected (action blocked).
   */
  const showConnectionRequired = useCallback(
    (platform: SocialPlatform, action: string = 'generate'): boolean => {
      const isConnected = checkChannelConnected(platform);
      
      if (!isConnected) {
        const messages = PLATFORM_MESSAGES[platform];
        const message = action === 'post' 
          ? messages.post 
          : action === 'schedule' 
            ? messages.schedule 
            : messages.generate;
        
        toast.error(message, { duration: 5000 });
        return false;
      }
      
      return true;
    },
    [checkChannelConnected],
  );

  return {
    ...status,
    checkChannelConnected,
    showConnectionRequired,
    refreshStatus,
  };
}
