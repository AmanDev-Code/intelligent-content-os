// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
  ENDPOINTS: {
    GENERATION: '/generation',
    ANALYTICS: '/analytics',
    CONTENT: '/content',
    AUTH: '/auth'
  }
} as const;

// Supabase Configuration
export const SUPABASE_CONFIG = {
  PROJECT_ID: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID,
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
} as const;

// Social Platform Configuration
export const SOCIAL_PLATFORMS = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0A66C2',
    bgColor: 'bg-[#0A66C2]'
  },
  {
    id: 'twitter',
    name: 'X',
    icon: 'twitter',
    color: '#000000',
    bgColor: 'bg-[#000000]'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    bgColor: 'bg-[#E4405F]'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    bgColor: 'bg-[#1877F2]'
  }
] as const;

// Content Types
export const CONTENT_TYPES = [
  {
    id: 'text',
    label: 'Text Post',
    description: 'Simple text post'
  },
  {
    id: 'image',
    label: 'Image Post',
    description: 'Post with image'
  },
  {
    id: 'carousel',
    label: 'Carousel',
    description: 'Multi-slide post'
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Video content'
  }
] as const;

// Calendar Views
export const CALENDAR_VIEWS = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'list', label: 'List' }
] as const;

// Post Status
export const POST_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  FAILED: 'failed'
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  TIME: 'HH:mm',
  FULL: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd\'T\'HH:mm:ss'
} as const;