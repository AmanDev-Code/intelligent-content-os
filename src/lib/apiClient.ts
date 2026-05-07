// Global API Client with automatic authentication
import { supabase } from "@/integrations/supabase/client";
import { API_CONFIG } from "@/lib/constants";
import { getPreferredTimezoneSync } from "@/services/timezoneService";

// In-flight request deduplication cache
// Key: method + endpoint, Value: Promise of the response
const inFlightRequests = new Map<string, Promise<any>>();

// Response cache with TTL for GET requests
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 3000; // 3 seconds

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
        'X-User-Timezone': getPreferredTimezoneSync(),
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
    const method = options.method || 'GET';
    const cacheKey = `${method}:${endpoint}`;
    
    // For GET requests, check response cache first
    if (method === 'GET') {
      const cached = responseCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }
      
      // Check if there's already an in-flight request for this endpoint
      const inFlight = inFlightRequests.get(cacheKey);
      if (inFlight) {
        return inFlight;
      }
    }
    
    // Create the actual request promise
    const requestPromise = this.executeRequest(endpoint, options, cacheKey, method);
    
    // For GET requests, store in in-flight map
    if (method === 'GET') {
      inFlightRequests.set(cacheKey, requestPromise);
      requestPromise.finally(() => {
        inFlightRequests.delete(cacheKey);
      });
    }
    
    return requestPromise;
  }

  private async executeRequest(endpoint: string, options: RequestInit, cacheKey: string, method: string): Promise<any> {
    try {
      // JSON Content-Type only for non-FormData bodies (multipart sets its own boundary)
      const hasBody = options.body !== undefined;
      const isFormData = options.body instanceof FormData;
      const headers = await this.getAuthHeaders(hasBody && !isFormData);
      const url = `${this.baseURL}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        mode: 'cors',
      });

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
      
      // Cache GET responses
      if (method === 'GET') {
        responseCache.set(cacheKey, { data, timestamp: Date.now() });
      }
      
      return data;
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        throw error;
      }
      console.error(`🚨 API Request Failed:`, error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to server. Please check your internet connection and try again.`);
      }
      throw error;
    }
  }

  // HTTP Methods
  async get(
    endpoint: string,
    options?: { params?: Record<string, any>; signal?: AbortSignal },
  ): Promise<any> {
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
    return this.request(url, { method: 'GET', signal: options?.signal });
  }

  async post(
    endpoint: string,
    data?: any,
    init?: Omit<RequestInit, 'method' | 'body'>
  ): Promise<any> {
    const options: RequestInit = {
      method: 'POST',
      ...init,
    };
    if (data instanceof FormData) {
      options.body = data;
    } else if (data !== undefined) {
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
    changePlan: (planType: 'standard' | 'pro' | 'ultimate', billingCycle: 'monthly' | 'yearly') =>
      apiClient.post('/subscription/change-plan', { planType, billingCycle }),
    invoiceUrl: (transactionId: string) => apiClient.get(`/subscription/invoice/${transactionId}`),
    usage: () => apiClient.get('/subscription/usage'),
  },

  // Generation endpoints
  generation: {
    start: (preferences?: any) => apiClient.post('/generation/start', { preferences }),
    customTopic: (data: {
      topic: string;
      platform: 'linkedin' | 'instagram' | 'x';
      /** Backend accepts legacy `post` as alias for `text`; prefer `text`. */
      contentType: 'text' | 'image' | 'carousel' | 'post';
      tonality: string;
      wordLimit: { kind: 'short' | 'medium' | 'long' } | { kind: 'custom'; words: number };
      imageCount?: number;
      slideCount?: number;
      carouselVisualStyle?:
        | 'auto'
        | 'handwritten_notebook'
        | 'handwritten_notebook_dense'
        | 'whiteboard_notes'
        | 'diagram_clean'
        | 'stock_visual';
      carouselNoteDensity?: 'compact' | 'standard' | 'dense';
      carouselSubjectMode?: 'auto' | 'programming' | 'general';
      /** Opt in to internal SaaS dataset capture metadata (no vendor retraining). */
      trainingDataCaptureOptIn?: boolean;
    }) => apiClient.post('/generation/custom-topic', data),
    job: (jobId: string) => apiClient.get(`/generation/job/${jobId}`),
    checkCompletion: (jobId: string) => apiClient.post(`/generation/job/${jobId}/check-completion`),
    content: (page = 1, limit = 50, source?: string) => apiClient.get(`/generation/content?page=${page}&limit=${limit}${source ? `&source=${source}` : ''}`),
    contentById: (contentId: string) => apiClient.get(`/generation/content/${contentId}`),
    jobContent: (jobId: string) => apiClient.get(`/generation/job/${jobId}/content`),
    retry: (jobId: string) => apiClient.post(`/generation/job/${jobId}/retry`),
    scheduled: (page = 1, limit = 50) => apiClient.get(`/generation/scheduled?page=${page}&limit=${limit}`),
    /**
     * Regenerate a single AI-generated image inside an existing post.
     * Returns `{ jobId, estimatedCost, message }`. Charges 3 credits up front;
     * the worker refunds them via the granular slice ledger if generation fails.
     */
    regenerateImage: (
      contentId: string,
      imageIndex: number,
      opts?: { originalPrompt?: string; userOverridePrompt?: string },
    ): Promise<{ jobId: string; estimatedCost: number; message: string }> =>
      apiClient.post('/generation/regenerate/image', {
        contentId,
        imageIndex,
        originalPrompt: opts?.originalPrompt,
        userOverridePrompt: opts?.userOverridePrompt,
      }),
    /**
     * Regenerate every slide of an existing carousel using the persisted deck
     * JSON (no LLM re-call). Returns `{ jobId, estimatedCost, message }`.
     * Charges 2.5 × slideCount credits as granular slices.
     */
    regenerateCarousel: (
      contentId: string,
      opts?: { slideCount?: number },
    ): Promise<{ jobId: string; estimatedCost: number; message: string }> =>
      apiClient.post('/generation/regenerate/carousel', {
        contentId,
        slideCount: opts?.slideCount,
      }),
    /**
     * Soft-delete generated content. Removes from recent generations and all generations.
     */
    deleteContent: (contentId: string) => apiClient.delete(`/generation/content/${contentId}`),
    /**
     * Format and improve content using AI for LinkedIn posting.
     * Returns `{ formattedContent, creditsCost }`. Costs 0.5 credits.
     */
    formatContent: (content: string): Promise<{ formattedContent: string; creditsCost: number }> =>
      apiClient.post('/generation/format-content', { content }),
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
    analytics: (limit?: number, params?: { actorType?: 'member' | 'organization'; organizationUrn?: string }) => {
      const search = new URLSearchParams();
      if (limit) search.set('limit', String(limit));
      if (params?.actorType) search.set('actorType', params.actorType);
      if (params?.organizationUrn) search.set('organizationUrn', params.organizationUrn);
      const qs = search.toString();
      return apiClient.get(`/linkedin/analytics${qs ? `?${qs}` : ''}`);
    },
    insights: (periodDays?: number, params?: { actorType?: 'member' | 'organization'; organizationUrn?: string }) => {
      const search = new URLSearchParams();
      if (periodDays) search.set('periodDays', String(periodDays));
      if (params?.actorType) search.set('actorType', params.actorType);
      if (params?.organizationUrn) search.set('organizationUrn', params.organizationUrn);
      const qs = search.toString();
      return apiClient.get(`/linkedin/insights${qs ? `?${qs}` : ''}`);
    },
    accountType: (params?: { actorType?: 'member' | 'organization'; organizationUrn?: string }) => {
      const search = new URLSearchParams();
      if (params?.actorType) search.set('actorType', params.actorType);
      if (params?.organizationUrn) search.set('organizationUrn', params.organizationUrn);
      const qs = search.toString();
      return apiClient.get(`/linkedin/account-type${qs ? `?${qs}` : ''}`);
    },
    postingIdentities: () => apiClient.get('/linkedin/posting-identities'),
    dashboard: () => apiClient.get('/linkedin/dashboard'),
    organization: (params?: { organizationUrn?: string }) => {
      const search = new URLSearchParams();
      if (params?.organizationUrn) search.set('organizationUrn', params.organizationUrn);
      const qs = search.toString();
      return apiClient.get(`/linkedin/organization${qs ? `?${qs}` : ''}`);
    },
    /** Server-issued OAuth URL (opaque state in Redis; do not use GET /linkedin/auth). */
    startOAuth: () => apiClient.post('/linkedin/oauth/start', {}),
    publish: (contentId: string) => apiClient.post('/linkedin/publish', { contentId }),
    disconnect: () => apiClient.post('/linkedin/disconnect'),
  },

  // Media endpoints
  media: {
    generateImage: (data: any) => apiClient.post('/media/generate-image', data),
    generateCarousel: (data: any) => apiClient.post('/media/generate-carousel', data),
    generateCarouselAsync: (data: any) => apiClient.post('/media/generate-carousel-async', data),
    getCarouselJobStatus: (jobId: string) => apiClient.get(`/media/carousel-job/${jobId}`),
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
    cancelScheduled: (jobId: string) => apiClient.post(`/posts/scheduled/${jobId}/cancel`),
    deleteScheduled: (jobId: string) => apiClient.delete(`/posts/scheduled/${jobId}`),
    getCalendar: (params?: any) => apiClient.get(`/posts/calendar${params ? `?${new URLSearchParams(params)}` : ''}`),
    getAnalytics: (params?: any) => apiClient.get(`/posts/analytics${params ? `?${new URLSearchParams(params)}` : ''}`),
  },

  // Moderation endpoints
  moderation: {
    wordList: () => apiClient.get('/moderation/word-list'),
    check: (text: string) => apiClient.post('/moderation/check', { text }),
  },

  // Health check
  health: () => apiClient.get('/health'),

  // Onboarding endpoints
  onboarding: {
    status: () => apiClient.get('/onboarding/status'),
    complete: (answers: {
      role?: string;
      goal?: string;
      teamSize?: string;
      postingFrequency?: string;
      focusArea?: string;
      referralSource?: string;
    }) => apiClient.post('/onboarding/complete', answers),
    tourComplete: () => apiClient.post('/onboarding/tour-complete', {}),
  },

  // Admin onboarding endpoints
  admin: {
    getOnboardingConfig: () => apiClient.get('/admin/onboarding/config'),
    updateOnboardingConfig: (payload: {
      enabled?: boolean;
      enabledAt?: string | null;
      questionVersion?: number;
      tourVersion?: number;
    }) => apiClient.put('/admin/onboarding/config', payload),
    listTags: () => apiClient.get('/admin/tags'),
    addTag: (payload: { tag: string; priority?: number }) =>
      apiClient.post('/admin/tags', payload),
    updateTag: (
      id: string,
      payload: { isActive?: boolean; priority?: number },
    ) => apiClient.patch(`/admin/tags/${id}`, payload),
    deleteTag: (id: string) => apiClient.delete(`/admin/tags/${id}`),
    refreshTag: (id: string) => apiClient.post(`/admin/tags/${id}/refresh`, {}),
    refreshAllTags: () => apiClient.post('/admin/tags/refresh-all', {}),
    pruneTrendingOldest: (count = 200) =>
      apiClient.post('/admin/trending/prune-oldest', { count }),
    careersListJobs: () => apiClient.get('/admin/careers/jobs'),
    careersCreateJob: (payload: Record<string, unknown>) =>
      apiClient.post('/admin/careers/jobs', payload),
    careersGetJob: (id: string) => apiClient.get(`/admin/careers/jobs/${id}`),
    careersUpdateJob: (id: string, payload: Record<string, unknown>) =>
      apiClient.patch(`/admin/careers/jobs/${id}`, payload),
    careersDeleteJob: (id: string) => apiClient.delete(`/admin/careers/jobs/${id}`),
    careersListApplications: (jobId: string) =>
      apiClient.get(`/admin/careers/jobs/${jobId}/applications`),
    careersAiField: (payload: {
      field: string;
      context: Record<string, unknown>;
      existingDraft?: string;
    }) => apiClient.post('/admin/careers/ai/field', payload),
    careersAiAllSections: (payload: {
      context: Record<string, unknown>;
      existing?: Record<string, string>;
    }) => apiClient.post('/admin/careers/ai/all-sections', payload),
    blogListPosts: (params?: { status?: string; q?: string }) =>
      apiClient.get('/admin/blog/posts', { params }),
    blogGetPost: (id: string) => apiClient.get(`/admin/blog/posts/${id}`),
    blogCreatePost: (payload: Record<string, unknown>) => apiClient.post('/admin/blog/posts', payload),
    blogUpdatePost: (id: string, payload: Record<string, unknown>) =>
      apiClient.patch(`/admin/blog/posts/${id}`, payload),
    blogDeletePost: (id: string) => apiClient.delete(`/admin/blog/posts/${id}`),
    blogListEditors: () => apiClient.get('/admin/blog/editors'),
    blogGrantEditor: (user_id: string) => apiClient.post('/admin/blog/editors', { user_id }),
    blogRevokeEditor: (userId: string) => apiClient.delete(`/admin/blog/editors/${userId}`),
    seoPagesList: () => apiClient.get('/admin/seo/pages'),
    seoPagesOne: (route: string) => apiClient.get('/admin/seo/pages/one', { params: { route } }),
    seoPagesUpsert: (payload: Record<string, unknown>) => apiClient.put('/admin/seo/pages', payload),
    seoPagesDelete: (route: string) =>
      apiClient.delete(`/admin/seo/pages?route=${encodeURIComponent(route)}`),
  },

  maintenance: {
    status: () => apiClient.get("/maintenance/status"),
    getConfig: () => apiClient.get("/admin/maintenance"),
    setConfig: (payload: {
      enabled?: boolean;
      scheduledStart?: string | null;
      scheduledEnd?: string | null;
      message?: string | null;
    }) => apiClient.post("/admin/maintenance", payload),
    clearSchedule: () => apiClient.delete("/admin/maintenance/schedule"),
  },

  /** Public marketing blog (not social `api.posts`). */
  blog: {
    listPublished: (params?: { post_kind?: string; tag?: string; limit?: number; offset?: number }) =>
      apiClient.get('/blog/posts', { params }),
    postByPath: (path: string) => apiClient.get('/blog/post', { params: { path } }),
    pageSeo: (route: string) => apiClient.get('/blog/page-seo', { params: { route } }),
    myAccess: () => apiClient.get('/blog/my-access'),
  },

  careers: {
    categories: () => apiClient.get('/careers/categories'),
    jobs: (params?: { category?: string }) =>
      apiClient.get('/careers/jobs', { params }),
    job: (slug: string) => apiClient.get(`/careers/jobs/${slug}`),
    apply: (slug: string, payload: Record<string, unknown>) =>
      apiClient.post(`/careers/jobs/${slug}/apply`, payload),
  },

  content: {
    trending: (params?: {
      tag?: string;
      limit?: number;
      offset?: number;
      signal?: AbortSignal;
    }) => {
      const { signal, tag, limit, offset } = params || {};
      return apiClient.get('/content/trending', {
        params: { tag, limit, offset },
        signal,
      });
    },
    trendingDebug: (params?: { tag?: string; limit?: number }) =>
      apiClient.get('/content/trending/debug', { params }),
  },

  /** First-post / reminder feedback (product). */
  feedback: {
    eligibility: () => apiClient.get("/feedback/eligibility"),
    submit: (body: { rating: number; message?: string }) =>
      apiClient.post("/feedback/submit", body),
    skip: () => apiClient.post("/feedback/skip", {}),
  },

  /** General user feedback (can submit multiple times). */
  userFeedback: {
    submit: (body: { type: "bug" | "feature" | "general" | "other"; message: string; rating?: number }) =>
      apiClient.post("/user-feedback/submit", body),
    history: (params?: { page?: number; limit?: number }) =>
      apiClient.get("/user-feedback/history", { params }),
  },

  /** Referral program endpoints. */
  referral: {
    getMyCode: () => apiClient.get("/referral/my-code"),
    getMyReferrals: (params?: { limit?: number; offset?: number }) =>
      apiClient.get("/referral/my-referrals", { params }),
    getStats: () => apiClient.get("/referral/stats"),
    getSettings: () => apiClient.get("/referral/settings"),
    getBanners: () => apiClient.get("/referral/banners"),
    validateCode: (code: string) => apiClient.post(`/referral/validate/${encodeURIComponent(code)}`),
  },

  /** Public referral endpoints (no auth required). */
  publicReferral: {
    validateCode: (code: string) => apiClient.post(`/public/referral/validate/${encodeURIComponent(code)}`),
    getSettings: () => apiClient.get("/public/referral/settings"),
  },

  /** Admin referral management. */
  adminReferral: {
    getSettings: () => apiClient.get("/admin/referral/settings"),
    updateSettings: (payload: {
      credits_per_referral?: number;
      min_actions_to_complete?: number;
      is_program_active?: boolean;
      terms_and_conditions?: string;
    }) => apiClient.put("/admin/referral/settings", payload),
    getBanners: () => apiClient.get("/admin/referral/banners"),
    createBanner: (formData: FormData) => apiClient.post("/admin/referral/banners", formData),
    updateBanner: (id: string, formData: FormData) => apiClient.put(`/admin/referral/banners/${id}`, formData),
    deleteBanner: (id: string) => apiClient.delete(`/admin/referral/banners/${id}`),
    reorderBanners: (orders: { id: string; display_order: number }[]) =>
      apiClient.post("/admin/referral/banners/reorder", { orders }),
    getStats: () => apiClient.get("/admin/referral/stats"),
    getTopReferrers: (limit?: number) =>
      apiClient.get("/admin/referral/top-referrers", { params: { limit } }),
    getUserReferralInfo: (userId: string) => apiClient.get(`/admin/referral/user/${userId}`),
    getCodes: (params?: { page?: number; limit?: number; search?: string; status?: 'active' | 'inactive' | 'all' }) =>
      apiClient.get("/admin/referral/codes", { params }),
    updateCode: (id: string, payload: { is_active?: boolean }) =>
      apiClient.patch(`/admin/referral/codes/${id}`, payload),
    deleteCode: (id: string) => apiClient.delete(`/admin/referral/codes/${id}`),
    createCode: (userId: string) => apiClient.post("/admin/referral/codes", { user_id: userId }),
  },
};