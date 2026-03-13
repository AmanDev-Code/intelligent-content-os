// Global API Client with automatic authentication
import { supabase } from "@/integrations/supabase/client";
import { API_CONFIG } from "@/lib/constants";

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private async getAuthHeaders(includeContentType: boolean = true): Promise<HeadersInit> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth session error:', error);
      }

      const headers: HeadersInit = {
        'ngrok-skip-browser-warning': 'true',
      };

      // Only add Content-Type if requested (when we have a body)
      if (includeContentType) {
        headers['Content-Type'] = 'application/json';
      }

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      return headers;
    } catch (error) {
      console.error('Error getting auth headers:', error);
      return {
        'ngrok-skip-browser-warning': 'true',
        ...(includeContentType && { 'Content-Type': 'application/json' }),
      };
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      // Only include Content-Type header if we have a body
      const hasBody = options.body !== undefined;
      const headers = await this.getAuthHeaders(hasBody);
      const url = `${this.baseURL}${endpoint}`;

      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`, hasBody ? 'with body' : 'no body');

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        mode: 'cors',
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Unable to read error response';
        }
        console.error(`❌ API Error: ${response.status} ${errorText}`);
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ API Success:`, data);
      return data;
    } catch (error) {
      console.error(`🚨 API Request Failed:`, error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to server. Please check your internet connection and try again.`);
      }
      throw error;
    }
  }

  // HTTP Methods
  async get(endpoint: string, options?: { params?: Record<string, any> }): Promise<any> {
    let url = endpoint;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (endpoint.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint: string, data?: any): Promise<any> {
    const options: RequestInit = {
      method: 'POST',
    };
    
    // Only set JSON content-type and body if we have data
    if (data !== undefined) {
      options.body = JSON.stringify(data);
    }
    
    return this.request(endpoint, options);
  }

  async put(endpoint: string, data?: any): Promise<any> {
    const options: RequestInit = {
      method: 'PUT',
    };
    
    // Only set body if we have data
    if (data !== undefined) {
      options.body = JSON.stringify(data);
    }
    
    return this.request(endpoint, options);
  }

  async delete(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async patch(endpoint: string, data?: any): Promise<any> {
    const options: RequestInit = {
      method: 'PATCH',
    };
    
    // Only set body if we have data
    if (data !== undefined) {
      options.body = JSON.stringify(data);
    }
    
    return this.request(endpoint, options);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Convenience methods for common endpoints
export const api = {
  // Quota endpoints
  quota: {
    get: () => apiClient.get('/quota'),
    check: () => apiClient.get('/quota/check'),
  },

  // Subscription endpoints
  subscription: {
    get: () => apiClient.get('/subscription'),
    plans: () => apiClient.get('/public/plans'),
    billing: () => apiClient.get('/subscription/billing'),
    update: (planType: string, billingCycle: string) => 
      apiClient.put('/subscription/update', { planType, billingCycle }),
    cancel: () => apiClient.post('/subscription/cancel'),
    usage: () => apiClient.get('/subscription/usage'),
  },

  // Generation endpoints
  generation: {
    start: (preferences?: any) => apiClient.post('/generation/start', { preferences }),
    job: (jobId: string) => apiClient.get(`/generation/job/${jobId}`),
    checkCompletion: (jobId: string) => apiClient.post(`/generation/job/${jobId}/check-completion`),
    content: (page = 1, limit = 50) => apiClient.get(`/generation/content?page=${page}&limit=${limit}`),
    contentById: (contentId: string) => apiClient.get(`/generation/content/${contentId}`),
    jobContent: (jobId: string) => apiClient.get(`/generation/job/${jobId}/content`),
    retry: (jobId: string) => apiClient.post(`/generation/job/${jobId}/retry`),
    scheduled: (page = 1, limit = 50) => apiClient.get(`/generation/scheduled?page=${page}&limit=${limit}`),
  },

  // Cache endpoints
  cache: {
    get: (key: string) => apiClient.get(`/cache/${key}`),
    set: (key: string, value: any, ttl?: number) => apiClient.post('/cache/set', { key, value, ttl }),
    delete: (key: string) => apiClient.delete(`/cache/${key}`),
    invalidateUser: (userId: string) => apiClient.delete(`/cache/invalidate/user/${userId}`),
    stats: () => apiClient.get('/cache/stats/info'),
    clear: () => apiClient.delete('/cache/clear/all'),
  },

  // LinkedIn endpoints
  linkedin: {
    status: () => apiClient.get('/linkedin/status'),
    metrics: () => apiClient.get('/linkedin/metrics'),
    analytics: (limit?: number) => apiClient.get(`/linkedin/analytics${limit ? `?limit=${limit}` : ''}`),
    dashboard: () => apiClient.get('/linkedin/dashboard'),
    organization: () => apiClient.get('/linkedin/organization'),
    publish: (contentId: string) => apiClient.post('/linkedin/publish', { contentId }),
    disconnect: () => apiClient.post('/linkedin/disconnect'),
  },

  // Media endpoints
  media: {
    generateImage: (data: any) => apiClient.post('/media/generate-image', data),
    generateCarousel: (data: any) => apiClient.post('/media/generate-carousel', data),
    getFiles: (params?: any) => apiClient.get(`/media/files${params ? `?${new URLSearchParams(params)}` : ''}`),
    deleteFile: (fileId: string) => apiClient.delete(`/media/files/${fileId}`),
    getUsage: () => apiClient.get('/media/usage'),
  },

  // Posts endpoints
  posts: {
    publish: (data: any) => apiClient.post('/posts/publish', data),
    schedule: (data: any) => apiClient.post('/posts/schedule', data),
    getScheduled: (params?: any) => apiClient.get(`/posts/scheduled${params ? `?${new URLSearchParams(params)}` : ''}`),
    getPublished: (params?: any) => apiClient.get(`/posts/published${params ? `?${new URLSearchParams(params)}` : ''}`),
    cancelScheduled: (jobId: string) => apiClient.delete(`/posts/scheduled/${jobId}`),
    getCalendar: (params?: any) => apiClient.get(`/posts/calendar${params ? `?${new URLSearchParams(params)}` : ''}`),
    getAnalytics: (params?: any) => apiClient.get(`/posts/analytics${params ? `?${new URLSearchParams(params)}` : ''}`),
  },

  // Health check
  health: () => apiClient.get('/health'),
};