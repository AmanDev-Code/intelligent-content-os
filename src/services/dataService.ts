import { supabase } from "@/integrations/supabase/client";
import { cacheService, userKey, jobKey } from "./cacheService";
import { API_CONFIG } from "@/lib/constants";
import { api } from "@/lib/apiClient";

export interface GeneratedContent {
  id: string;
  title: string;
  content: string;
  ai_score: number | null;
  ai_reasoning: string | null;
  hashtags: string[] | null;
  visual_type: string | null;
  visual_url: string | null;
  carousel_urls: string[] | null;
  status: string;
  publish_status?: string;
  linkedin_post_id?: string;
  scheduled_for?: string;
  is_scheduled?: boolean;
  media_urls?: string[];
  pdf_url?: string;
  user_id: string;
  job_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GenerationJob {
  id: string;
  user_id: string;
  status: 'pending' | 'generating' | 'ready' | 'failed';
  progress: number;
  stage: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface UserQuota {
  userId: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  percentageUsed: number;
  planType: 'free' | 'standard' | 'pro' | 'ultimate';
  resetDate: string;
}

export class DataService {
  private static instance: DataService;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  /**
   * Get generated content by job ID with cache-first strategy
   */
  async getContentByJobId(jobId: string, userId: string): Promise<GeneratedContent[]> {
    const cacheKey = jobKey(jobId, userId, 'generated_content');
    
    // Try cache first
    const cachedData = await cacheService.get<GeneratedContent[]>(cacheKey);
    if (cachedData) {
      console.log('Content found in cache for job:', jobId);
      return cachedData;
    }

    // Fallback to database
    console.log('Cache miss, fetching content from database for job:', jobId);
    const { data, error } = await (supabase as any)
      .from('generated_content')
      .select('*')
      .eq('job_id', jobId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching content by job ID:', error);
      return [];
    }

    const result = data || [];
    
    // Cache the result
    if (result.length > 0) {
      await cacheService.set(cacheKey, result);
    }
    
    return result;
  }

  /**
   * Get recent generated content for a user with cache-first strategy (limited to 3 for preview)
   */
  async getRecentContent(userId: string, limit: number = 3): Promise<GeneratedContent[]> {
    const cacheKey = userKey(userId, 'recent_generations');
    
    // Try cache first
    const cachedData = await cacheService.get<GeneratedContent[]>(cacheKey);
    if (cachedData) {
      console.log('Recent content found in cache for user:', userId);
      return cachedData.slice(0, limit);
    }

    // Fallback to database
    console.log('Cache miss, fetching recent content from database for user:', userId);
    const { data, error } = await (supabase as any)
      .from('generated_content')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent content:', error);
      return [];
    }

    const result = data || [];
    
    // Cache the result
    if (result.length > 0) {
      await cacheService.set(cacheKey, result);
    }
    
    return result;
  }

  /**
   * Get paginated generated content for a user using backend API
   */
  async getPaginatedContent(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<PaginatedResponse<GeneratedContent>> {
    try {
      return await api.generation.content(page, limit);
    } catch (error) {
      console.error('Error fetching paginated content:', error);
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
          hasPrev: false,
        },
      };
    }
  }

  /**
   * Get paginated scheduled content for calendar view
   */
  async getPaginatedScheduledContent(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<PaginatedResponse<GeneratedContent>> {
    try {
      return await api.generation.scheduled(page, limit);
    } catch (error) {
      console.error('Error fetching scheduled content:', error);
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
          hasPrev: false,
        },
      };
    }
  }

  /**
   * Get generation job status with cache-first strategy
   */
  async getJobStatus(jobId: string, userId: string): Promise<GenerationJob | null> {
    const cacheKey = jobKey(jobId, userId, 'job_status');
    
    // Try cache first
    const cachedData = await cacheService.get<GenerationJob>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Fallback to database
    const { data, error } = await (supabase as any)
      .from('generation_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching job status:', error);
      return null;
    }

    const result = data as GenerationJob;
    
    // Cache the result with shorter TTL for job status
    if (result) {
      await cacheService.set(cacheKey, result, { ttl: 300 }); // 5 minutes
    }
    
    return result;
  }

  /**
   * Invalidate all cache for a user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await cacheService.invalidateUser(userId);
  }

  /**
   * Invalidate specific content cache
   */
  async invalidateContentCache(userId: string, jobId?: string): Promise<void> {
    // Invalidate recent content cache
    const recentKey = userKey(userId, 'recent_generations');
    await cacheService.delete(recentKey);

    // Invalidate specific job content cache if jobId provided
    if (jobId) {
      const jobContentKey = jobKey(jobId, userId, 'generated_content');
      await cacheService.delete(jobContentKey);
      
      const jobStatusKey = jobKey(jobId, userId, 'job_status');
      await cacheService.delete(jobStatusKey);
    }
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();

// Quota Management Functions
export const getUserQuota = async (userId: string): Promise<UserQuota> => {
  try {
    return await api.quota.get();
  } catch (error) {
    console.error('Error fetching user quota:', error);
    // Return default quota on error
    return {
      userId,
      totalCredits: 10000,
      usedCredits: 0,
      remainingCredits: 10000,
      percentageUsed: 0,
      planType: 'ultimate',
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }
};

export const checkQuotaAvailable = async (userId: string): Promise<{ hasQuota: boolean; quota: UserQuota }> => {
  try {
    return await api.quota.check();
  } catch (error) {
    console.error('Error checking quota:', error);
    const defaultQuota = await getUserQuota(userId);
    return {
      hasQuota: defaultQuota.remainingCredits > 0,
      quota: defaultQuota,
    };
  }
};

export const getQuotaColor = (percentageUsed: number): 'green' | 'orange' | 'red' => {
  // Green when you have more than 80% remaining (less than 20% used)
  if (percentageUsed < 20) return 'green';
  // Orange when you have 20-80% remaining (20-80% used) 
  if (percentageUsed < 80) return 'orange';
  // Red when you have less than 20% remaining (more than 80% used)
  return 'red';
};