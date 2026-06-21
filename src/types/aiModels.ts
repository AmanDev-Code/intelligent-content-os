export type AiModelCategory =
  | "text"
  | "text_formatter"
  | "vision"
  | "image"
  | "image_context"
  | "image_enhance"
  | "video"
  | "seo_generation"
  | "seo_analysis";

export const AI_MODEL_CATEGORIES: AiModelCategory[] = [
  "text",
  "text_formatter",
  "vision",
  "image",
  "image_context",
  "image_enhance",
  "video",
  "seo_generation",
  "seo_analysis",
];

export interface AiModelEntry {
  id: string;
  label: string;
  /** Bifrost model string, e.g. "bedrock/moonshotai.kimi-k2.5", "openai/gpt-4o". */
  model: string;
  provider: string;
  category: AiModelCategory;
  enabled: boolean;
  addedAt: string;
}

export type AiModelActiveMap = Record<AiModelCategory, string | null>;

export interface AiModelsState {
  active: AiModelActiveMap;
  models: AiModelEntry[];
  gateway: {
    baseUrl: string;
    hasApiKey: boolean;
    timeoutMs: number;
  };
}

/** A model the Bifrost gateway can serve (from GET /v1/models), for the browser. */
export interface AiCatalogModel {
  id: string;
  provider: string;
  category: AiModelCategory;
  label: string;
  inputModalities?: string[];
  outputModalities?: string[];
  contextLength?: number;
}

export interface AiModelTestResult {
  ok: boolean;
  latencyMs: number;
  message: string;
}

/* ───── Web Research (Tavily) ───── */

export interface WebResearchConfigResponse {
  enabled: boolean;
  maxResults: number;
  searchDepth: "basic" | "advanced";
  defaultTopic: "general" | "news" | "finance";
  timeRange?: "day" | "week" | "month" | "year";
  hasApiKey: boolean;
  keyPreview: string;
}

export type WebResearchConfigPatch = {
  tavilyApiKey?: string;
  enabled?: boolean;
  maxResults?: number;
  searchDepth?: "basic" | "advanced";
  defaultTopic?: "general" | "news" | "finance";
  timeRange?: "day" | "week" | "month" | "year" | "";
};

export interface WebResearchTestResult {
  ok: boolean;
  message?: string;
  query?: string;
  answer?: string;
  sourceCount?: number;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  responseTimeMs?: number;
}
