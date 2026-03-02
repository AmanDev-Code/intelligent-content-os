export type ContentStatus = 'draft' | 'generating' | 'ready' | 'posted' | 'failed';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing';
export type AppRole = 'admin' | 'moderator' | 'user';

export const GENERATION_STAGES = [
  'Scanning trends',
  'Analyzing signals',
  'Ranking opportunities',
  'Generating insights',
  'Writing content',
  'Designing visuals',
  'Finalizing',
] as const;

export type GenerationStage = typeof GENERATION_STAGES[number];
