import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Zap, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Calendar,
  Image as ImageIcon,
  FileText,
  Layers,
  RefreshCw,
  Wand2,
  Globe,
  Hash,
  CheckCircle2,
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  MoreHorizontal,
  SearchX,
  X,
  ThumbsUp,
  Share,
  Info,
  ArrowRight,
  Copy,
  BarChart3,
  Building2,
  Check,
  Bold,
  Italic,
  Underline,
  Smile,
  Upload,
  Coins
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuota } from "@/contexts/QuotaContext";
import { ScheduleModal } from '@/components/schedule/ScheduleModal';
import { toast } from "sonner";
import { useGenerationJob } from "@/hooks/useGenerationJob";
import { useSmoothProgress } from "@/hooks/useSmoothProgress";
import { dataService, getQuotaColor } from "@/services/dataService";
import { api } from "@/lib/apiClient";
import { apiClient } from "@/lib/apiClient";
import { dispatchFeedbackEligibilityRefresh } from "@/lib/feedbackEvents";
import { useProfanityCheck } from '@/hooks/useProfanityCheck';
import {
  formatInTimezone,
  getPreferredTimezoneSync,
  resolveTimezone,
} from "@/services/timezoneService";

const contentTypes = [
  { id: 'post', label: 'Text Post', icon: FileText, description: 'LinkedIn text post' },
  { id: 'image', label: 'Image Post', icon: ImageIcon, description: 'Post with AI-generated image' },
  { id: 'carousel', label: 'Carousel', icon: Layers, description: 'Multi-slide carousel post' },
];

export default function Agent() {
  interface TrendingHashtag {
    hashtag: string;
    score: number;
    usage_count: number;
    source_breakdown?: Record<string, number>;
  }
type PostingActorType = 'member' | 'organization';
interface PostingIdentity {
  id: string;
  actorType: PostingActorType;
  label: unknown;
  organizationUrn?: string;
  organizationName?: unknown;
  avatarUrl?: string;
}

const extractLinkedinLocalizedText = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  if (!value || typeof value !== "object") return null;

  const localized = (value as { localized?: Record<string, unknown> }).localized;
  if (localized && typeof localized === "object") {
    const localizedValue = Object.values(localized).find(
      (v) => typeof v === "string" && v.trim().length > 0,
    ) as string | undefined;
    if (localizedValue) return localizedValue.trim();
  }

  const directValue = Object.values(value as Record<string, unknown>).find(
    (v) => typeof v === "string" && v.trim().length > 0,
  ) as string | undefined;
  return directValue?.trim() || null;
};

const getIdentityDisplayName = (identity: PostingIdentity): string => {
  const fromLabel = extractLinkedinLocalizedText(identity.label);
  if (fromLabel) return fromLabel;
  const fromOrg = extractLinkedinLocalizedText(identity.organizationName);
  if (fromOrg) return fromOrg;
  return identity.actorType === "organization" ? "Company Page" : "Personal profile";
};

  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('post');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedTrending, setSelectedTrending] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<'trending' | 'custom'>('trending');
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [recentGenerations, setRecentGenerations] = useState<any[]>([]);
  const [totalGenerationsCount, setTotalGenerationsCount] = useState<number>(0);
  const [recentSourceFilter, setRecentSourceFilter] = useState<'all' | 'viral' | 'custom'>('all');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showHashtagsModal, setShowHashtagsModal] = useState(false);
  const [popularHashtags, setPopularHashtags] = useState<
    Array<{
      tag: string;
      count: number;
      trend: 'up' | 'down' | 'stable';
      score: number;
      rank: number;
      source_breakdown?: Record<string, number>;
    }>
  >([]);
  const [loadingHashtags, setLoadingHashtags] = useState(false);
  const [loadingMoreHashtags, setLoadingMoreHashtags] = useState(false);
  const [trendingTotal, setTrendingTotal] = useState<number | null>(null);
  const [trendingHasMore, setTrendingHasMore] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [selectedContentForAction, setSelectedContentForAction] = useState<any>(null);
  const [isSchedulingExpanded, setIsSchedulingExpanded] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [editedHashtags, setEditedHashtags] = useState<string[]>([]);
  const [newHashtagInput, setNewHashtagInput] = useState('');
  const { quota: userQuota, loading: loadingQuota, refreshQuota } = useQuota();
  const [tourDemoStep, setTourDemoStep] = useState<
    "idle" | "generated" | "scheduled"
  >("idle");
  const [showTourDemo, setShowTourDemo] = useState(false);
  const activeCarouselPollsRef = useRef<Map<string, Promise<any>>>(new Map());
  const hasLoadedRecentRef = useRef<string | null>(null);
  /** One controller per modal open; used to cancel in-flight trending fetches when the dialog closes. */
  const trendingModalSessionRef = useRef<AbortController | null>(null);
  /** Buffer SSE events that arrive before currentJobId is set (timing race between API response and worker). */
  const sseEventBufferRef = useRef<Map<string, Array<{ type: 'progress' | 'completed'; detail: any }>>>(new Map());
  // Fetch guards to prevent duplicate requests
  const fetchingPostingIdentitiesRef = useRef(false);
  const lastPostingIdentitiesFetchRef = useRef<number>(0);
  const fetchingRecentGenerationsRef = useRef(false);
  const lastRecentGenerationsFetchRef = useRef<number>(0);
  const POSTING_IDENTITIES_CACHE_TTL = 10000; // 10 seconds
  const RECENT_GENERATIONS_CACHE_TTL = 5000; // 5 seconds
  const [userTimezone, setUserTimezone] = useState<string>(getPreferredTimezoneSync());
  const [postingIdentities, setPostingIdentities] = useState<PostingIdentity[]>([]);
  const [selectedPostingIdentityId, setSelectedPostingIdentityId] = useState<string>("");
  const [loadingPostingIdentities, setLoadingPostingIdentities] = useState(false);
  const [showPostingAccountModal, setShowPostingAccountModal] = useState(false);
  const [pendingPostAction, setPendingPostAction] = useState<"publish" | "schedule" | null>(null);
  const [pendingActionContent, setPendingActionContent] = useState<any>(null);
  const [hasConfirmedPostingIdentity, setHasConfirmedPostingIdentity] = useState(false);

  // Custom topic generation state
  const [tonality, setTonality] = useState('professional');
  const [wordLimitKind, setWordLimitKind] = useState<'short' | 'medium' | 'long' | 'custom'>('medium');
  const [customWordCount, setCustomWordCount] = useState(150);
  const [customWordCountInput, setCustomWordCountInput] = useState('150');
  const [imageCount, setImageCount] = useState(1);
  const [slideCount, setSlideCount] = useState(5);

  /** Custom-topic carousel visual base style (`auto` = server infers from topic). */
  const [carouselVisualStyle, setCarouselVisualStyle] = useState<
    | 'auto'
    | 'handwritten_notebook'
    | 'handwritten_notebook_dense'
    | 'whiteboard_notes'
    | 'diagram_clean'
    | 'stock_visual'
  >('auto');
  /** Resolved from SSE after text generation (server-side inference or explicit choice). */
  const [carouselStyleStatusLabel, setCarouselStyleStatusLabel] = useState<string | null>(null);

  const [carouselNoteDensityUi, setCarouselNoteDensityUi] = useState<
    'auto' | 'compact' | 'standard' | 'dense'
  >('auto');
  const [carouselSubjectModeUi, setCarouselSubjectModeUi] = useState<
    'auto' | 'programming' | 'general'
  >('auto');
  /**
   * Educational deck preset: `auto` infers from topic; the two named presets
   * render deterministically (cover + TOC + body) and skip LLM-image generation.
   * Pricing remains `2 + 2.5 × slideCount` (cover + TOC count toward the budget).
   */
  const [carouselDocumentModeUi, setCarouselDocumentModeUi] = useState<
    'auto' | 'none' | 'handwritten_notes' | 'structured_document'
  >('auto');
  const [trainingDatasetOptIn, setTrainingDatasetOptIn] = useState(false);
  const { isBlocked: isProfanityBlocked, checkText: checkProfanity } = useProfanityCheck();

  /** Advanced carousel plate / density / subject controls only for educational tone. */
  const showCarouselStudyControls = selectedType === 'carousel' && tonality === 'educational';

  /** Agent UI uses `post` for text; `/generation/custom-topic` expects `text` (matches backend + n8n). */
  const mapAgentContentTypeToApi = (t: string): "text" | "image" | "carousel" =>
    t === "post" ? "text" : (t as "image" | "carousel");

  /** Align with `PostGenerationInput` / n8n tonality keys. */
  const mapTonalityUiToApi = (id: string): string => {
    if (id === "casual") return "casual_friendly";
    if (id === "bold") return "bold_punchy";
    return id;
  };

  const customTopicCreditCost = useMemo(() => {
    if (selectedType === 'image') return 2 + 3 * imageCount;
    if (selectedType === 'carousel') return 2 + 2.5 * slideCount;
    return 2;
  }, [selectedType, imageCount, slideCount]);

  // N1: Custom-topic progress steps driven by SSE
  type ProgressStepStatus = 'pending' | 'running' | 'done' | 'failed';
  interface ProgressStep { key: string; label: string; status: ProgressStepStatus }

  /**
   * Build the dynamic progress step list for the modal.
   *
   * Step keys MUST match the backend's `subtaskKey` values emitted by
   * `notification.service.ts → emitGenerationProgress` and the worker pipeline
   * (`validating`, `reserving_credits`, `generating_text`, `enhancing_text`,
   * `planning_slides` a.k.a. `composing_pages`, `slide_1` … `slide_N`,
   * `saving`, `done`).
   *
   * `enhancing_text` covers quality-gate / sparse expansion / model rewrite —
   * it can take 30–80s for dense educational decks, so giving it its own row
   * keeps the modal moving instead of stalling on `Generating text`.
   *
   * Labels are human-friendly. When the backend renames `composing_pages` to
   * `planning_slides` we still render the same row (see PLANNING_SLIDES_KEYS).
   */
  const buildProgressSteps = useCallback((): ProgressStep[] => {
    const steps: ProgressStep[] = [
      { key: 'validating', label: 'Validating topic', status: 'pending' },
      { key: 'reserving_credits', label: 'Reserving credits', status: 'pending' },
      { key: 'generating_text', label: 'Generating text', status: 'pending' },
      { key: 'enhancing_text', label: 'Enhancing & expanding', status: 'pending' },
    ];
    if (selectedType === 'image') {
      for (let i = 1; i <= imageCount; i++) steps.push({ key: `image_${i}`, label: `Generating image ${i}`, status: 'pending' });
    }
    if (selectedType === 'carousel') {
      // Always show a "Planning slides" phase between text generation and per-page
      // rendering — the FE advances it locally even when the backend doesn't emit a
      // dedicated `composing_pages` event (older workers). Surface label is the same
      // for legacy LLM-image and document-deck pipelines so users see consistent UX.
      steps.push({ key: 'composing_pages', label: 'Planning slides', status: 'pending' });
      for (let i = 1; i <= slideCount; i++) {
        steps.push({
          key: `slide_${i}`,
          label: `Generating page ${i}/${slideCount}`,
          status: 'pending',
        });
      }
    }
    steps.push({ key: 'saving', label: 'Saving to storage', status: 'pending' });
    steps.push({ key: 'done', label: 'Done', status: 'pending' });
    return steps;
  }, [selectedType, imageCount, slideCount]);

  // Backend may emit either the legacy `composing_pages` key or the newer
  // `planning_slides` key for the same phase — accept both at the FE.
  const PLANNING_SLIDES_KEYS = useMemo(
    () => new Set<string>(['composing_pages', 'planning_slides']),
    [],
  );

  const [customProgressSteps, setCustomProgressSteps] = useState<ProgressStep[]>([]);
  const [customProgressStartedAt, setCustomProgressStartedAt] = useState<number | null>(null);
  const [customProgressElapsed, setCustomProgressElapsed] = useState(0);
  const [autoOpenContentId, setAutoOpenContentId] = useState<string | null>(null);

  useEffect(() => {
    if (!customProgressStartedAt) { setCustomProgressElapsed(0); return; }
    const interval = setInterval(() => setCustomProgressElapsed(Math.floor((Date.now() - customProgressStartedAt) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [customProgressStartedAt]);

  // Helper to process a single progress event (used for both live and buffered events)
  const processProgressEvent = useCallback((detail: any) => {
    const { subtaskKey, status, meta } = detail;

    const vis = meta?.carouselVisualStyle as string | undefined;
    const src = meta?.carouselStyleSource as string | undefined;
    if (
      vis &&
      ((subtaskKey === 'generating_text') ||
        (subtaskKey === 'enhancing_text') ||
        (typeof subtaskKey === 'string' && subtaskKey.startsWith('slide_')))
    ) {
      const styleLabels: Record<string, string> = {
        handwritten_notebook: 'Handwritten notebook (ruled paper + composited text)',
        handwritten_notebook_dense: 'Dense study notebook pages',
        whiteboard_notes: 'Whiteboard backdrop + composited text',
        diagram_clean: 'Clean abstract diagram backdrop',
        stock_visual: 'General illustrative backdrop',
      };
      const how = src === 'explicit' ? 'User-selected' : 'Auto-detected';
      setCarouselStyleStatusLabel(`${how}: ${styleLabels[vis] ?? vis}`);
    }

    const mapStatus = (backendStatus: string): ProgressStepStatus => {
      if (backendStatus === 'succeeded') return 'done';
      if (backendStatus === 'failed') return 'failed';
      if (backendStatus === 'running') return 'running';
      return 'pending';
    };

    const newStatus = mapStatus(status);

    // Map backend-emitted `planning_slides` onto the internal `composing_pages` row
    // so we don't render duplicate phases when the worker switches naming.
    const matchKey = (
      stepKey: string,
      eventKey: string,
    ): boolean => {
      if (stepKey === eventKey) return true;
      if (
        PLANNING_SLIDES_KEYS.has(stepKey) &&
        typeof eventKey === 'string' &&
        PLANNING_SLIDES_KEYS.has(eventKey)
      ) {
        return true;
      }
      return false;
    };

    setCustomProgressSteps(prev => {
      // Late SSE events can arrive after a stall-timeout cleared the array.
      // Don't drop them silently — they often carry the actual succeeded signal that
      // unblocks the modal flow on the slow path.
      if (prev.length === 0) {
        return prev;
      }

      const statusOrder: Record<ProgressStepStatus, number> = { pending: 0, running: 1, done: 2, failed: 2 };
      // If a slide_N event arrives but the matching step is missing (e.g. a previous
      // generation cleared the list, or the slide count was higher than expected),
      // synthesize a step entry so the event isn't dropped. Place it after any
      // existing slide_M (M<N) or before saving/done.
      const knownKeys = new Set(prev.map((s) => s.key));
      let prependedSlide: ProgressStep | null = null;
      if (typeof subtaskKey === 'string' && subtaskKey.startsWith('slide_') && !knownKeys.has(subtaskKey)) {
        const slideN = parseInt(subtaskKey.replace('slide_', ''), 10);
        if (Number.isFinite(slideN) && slideN > 0) {
          const totalSlides = Math.max(
            slideN,
            prev.filter((s) => s.key.startsWith('slide_')).length || slideN,
          );
          prependedSlide = {
            key: subtaskKey,
            label: `Generating page ${slideN}/${totalSlides}`,
            status: 'pending',
          };
        }
      }
      const working: ProgressStep[] = prependedSlide
        ? (() => {
            const insertBefore = prev.findIndex((s) => s.key === 'saving' || s.key === 'done');
            if (insertBefore < 0) return [...prev, prependedSlide];
            return [
              ...prev.slice(0, insertBefore),
              prependedSlide,
              ...prev.slice(insertBefore),
            ];
          })()
        : prev;
      let updated = working.map(s => {
        if (matchKey(s.key, subtaskKey) && statusOrder[newStatus] >= statusOrder[s.status]) {
          return { key: s.key, label: s.label, status: newStatus };
        }
        return { key: s.key, label: s.label, status: s.status };
      });

      // When slide_N starts running, mark all earlier prep phases (validating,
      // reserving_credits, generating_text, enhancing_text,
      // composing_pages/planning_slides) and earlier slides as done. This gives
      // users a smooth advance through the modal even when the worker emits
      // per-slide events back-to-back without an explicit `succeeded` for the
      // prior phase.
      if (typeof subtaskKey === 'string' && subtaskKey.startsWith('slide_') && newStatus === 'running') {
        const currentSlideNum = parseInt(subtaskKey.replace('slide_', ''), 10);
        updated = updated.map(s => {
          if (s.key.startsWith('slide_')) {
            const stepSlideNum = parseInt(s.key.replace('slide_', ''), 10);
            if (stepSlideNum < currentSlideNum && s.status !== 'done' && s.status !== 'failed') {
              return { ...s, status: 'done' as ProgressStepStatus };
            }
          }
          if (
            (s.key === 'validating' ||
              s.key === 'reserving_credits' ||
              s.key === 'generating_text' ||
              s.key === 'enhancing_text' ||
              PLANNING_SLIDES_KEYS.has(s.key)) &&
            s.status !== 'done' &&
            s.status !== 'failed'
          ) {
            return { ...s, status: 'done' as ProgressStepStatus };
          }
          return s;
        });
      }

      // Auto-advance the enhancing_text row whenever generating_text resolves
      // succeeded — the backend now drives this explicitly via lifecycle, but we
      // still defensively advance it here in case the explicit emit is dropped.
      if (subtaskKey === 'generating_text' && status === 'succeeded') {
        updated = updated.map(s =>
          s.key === 'enhancing_text' && s.status === 'pending'
            ? { ...s, status: 'running' as ProgressStepStatus }
            : s
        );
      }

      // When enhancing_text resolves succeeded, surface planning_slides as
      // running so the carousel deck modal advances to the per-page rendering
      // queue without waiting for an explicit `planning_slides` event.
      if (subtaskKey === 'enhancing_text' && status === 'succeeded') {
        updated = updated.map(s => {
          if (s.key === 'generating_text' && s.status !== 'done' && s.status !== 'failed') {
            return { ...s, status: 'done' as ProgressStepStatus };
          }
          if (
            PLANNING_SLIDES_KEYS.has(s.key) &&
            (s.status === 'pending' || s.status === 'running')
          ) {
            return { ...s, status: 'running' as ProgressStepStatus };
          }
          return s;
        });
      }

      // Auto-advance the planning row whenever generating_text resolves succeeded
      // (start running) or whenever any slide_N arrives (mark done).
      const hasPlanning = updated.some(s => PLANNING_SLIDES_KEYS.has(s.key));
      if (hasPlanning) {
        if (subtaskKey === 'generating_text' && status === 'succeeded') {
          updated = updated.map(s =>
            PLANNING_SLIDES_KEYS.has(s.key) && s.status === 'pending'
              ? { ...s, status: 'running' as ProgressStepStatus }
              : s
          );
        }
        if (typeof subtaskKey === 'string' && subtaskKey.startsWith('slide_') && status === 'running') {
          updated = updated.map(s => {
            if (
              s.key === 'enhancing_text' &&
              s.status !== 'done' &&
              s.status !== 'failed'
            ) {
              return { ...s, status: 'done' as ProgressStepStatus };
            }
            if (PLANNING_SLIDES_KEYS.has(s.key) && s.status !== 'failed') {
              return { ...s, status: 'done' as ProgressStepStatus };
            }
            return s;
          });
        }
      }

      return updated;
    });
  }, [PLANNING_SLIDES_KEYS]);

  // Helper to process a completed event
  const processCompletedEvent = useCallback((detail: any) => {
    setCustomProgressSteps(prev => prev.map(s => ({ ...s, status: s.status === 'pending' ? 'done' : s.status })));
    setCustomProgressStartedAt(null);
    setIsGenerating(false);
    setIsComplete(true);
    setIsFailed(false);
    if (detail?.contentId) {
      setAutoOpenContentId(detail.contentId);
    }
  }, []);

  // Process buffered events when currentJobId becomes available
  useEffect(() => {
    if (!currentJobId) return;

    const bufferedEvents = sseEventBufferRef.current.get(currentJobId);
    if (bufferedEvents && bufferedEvents.length > 0) {
      for (const event of bufferedEvents) {
        if (event.type === 'progress') {
          processProgressEvent(event.detail);
        } else if (event.type === 'completed') {
          processCompletedEvent(event.detail);
        }
      }
      sseEventBufferRef.current.delete(currentJobId);
    }
  }, [currentJobId, processProgressEvent, processCompletedEvent]);

  useEffect(() => {
    const handleSSEProgress = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const eventJobId = detail?.generationId;

      if (currentJobId && eventJobId === currentJobId) {
        processProgressEvent(detail);
        return;
      }

      // Buffer events that arrive before currentJobId is set (worker can emit
      // before the start-generation HTTP response returns).
      if (!currentJobId && isGenerating && eventJobId) {
        const buffer = sseEventBufferRef.current.get(eventJobId) || [];
        buffer.push({ type: 'progress', detail });
        sseEventBufferRef.current.set(eventJobId, buffer);
      }
    };

    const handleSSECompleted = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const eventJobId = detail?.generationId;

      if (currentJobId && eventJobId === currentJobId) {
        processCompletedEvent(detail);
        return;
      }

      if (!currentJobId && isGenerating && eventJobId) {
        const buffer = sseEventBufferRef.current.get(eventJobId) || [];
        buffer.push({ type: 'completed', detail });
        sseEventBufferRef.current.set(eventJobId, buffer);
      }
    };
    
    window.addEventListener('trndinn:generation-progress', handleSSEProgress);
    window.addEventListener('trndinn:generation-completed', handleSSECompleted);
    return () => {
      window.removeEventListener('trndinn:generation-progress', handleSSEProgress);
      window.removeEventListener('trndinn:generation-completed', handleSSECompleted);
    };
  }, [currentJobId, isGenerating, processProgressEvent, processCompletedEvent]);

  // N1: 5s polling fallback when SSE stalls
  useEffect(() => {
    if (!currentJobId || !isGenerating || generationMode !== 'custom') return;
    const pollInterval = setInterval(async () => {
      try {
        const jobStatus = await api.generation.job(currentJobId);
        if (jobStatus?.status === 'ready' && jobStatus?.contentId) {
          setCustomProgressSteps(prev => prev.map(s => ({ ...s, status: s.status === 'pending' ? 'done' : s.status })));
          setCustomProgressStartedAt(null);
          setAutoOpenContentId(jobStatus.contentId);
          setIsGenerating(false);
          setIsComplete(true);
          setIsFailed(false);
          clearInterval(pollInterval);
        } else if (jobStatus?.status === 'failed') {
          setIsGenerating(false);
          setIsFailed(true);
          setIsComplete(true);
          setCustomProgressStartedAt(null);
          // Mark in-flight steps as failed but keep the list so late events can settle.
          setCustomProgressSteps(prev =>
            prev.map(s =>
              s.status === 'pending' || s.status === 'running'
                ? { ...s, status: 'failed' as ProgressStepStatus }
                : s,
            ),
          );
          clearInterval(pollInterval);
        }
      } catch { /* ignore polling errors */ }
    }, 5000);
    return () => clearInterval(pollInterval);
  }, [currentJobId, isGenerating, generationMode]);

  // N2: Auto-open PostModal when generation completes
  useEffect(() => {
    if (!autoOpenContentId) return;
    (async () => {
      try {
        const content = await api.generation.contentById(autoOpenContentId);
        if (content) {
          setSelectedContent(dataService.normalizeGeneratedContent(content));
          setShowContentModal(true);
          await fetchRecentGenerations(undefined, true); // Force refresh after new content
        }
      } catch { /* best effort */ }
      setAutoOpenContentId(null);
    })();
  }, [autoOpenContentId]);

  useEffect(() => {
    void resolveTimezone().then(setUserTimezone).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (isProfanityBlocked) {
      toast.error("Your topic contains inappropriate language. Please modify it before generating.", { duration: 4000 });
    }
  }, [isProfanityBlocked]);

  useEffect(() => {
    if (tonality !== 'educational') {
      setCarouselVisualStyle('auto');
      setCarouselNoteDensityUi('auto');
      setCarouselSubjectModeUi('auto');
      setCarouselDocumentModeUi('auto');
      setTrainingDatasetOptIn(false);
    }
  }, [tonality]);

  /**
   * When user picks one of the two structured presets, density/programming knobs are
   * implicit (presets imply density + programming friendliness). Reset them so they
   * don't silently override the document-deck flow on the server.
   */
  const isDocumentDeckPresetActive =
    carouselDocumentModeUi === 'handwritten_notes' ||
    carouselDocumentModeUi === 'structured_document';
  useEffect(() => {
    if (isDocumentDeckPresetActive) {
      if (carouselNoteDensityUi !== 'auto') setCarouselNoteDensityUi('auto');
      if (carouselSubjectModeUi !== 'auto') setCarouselSubjectModeUi('auto');
    }
  }, [isDocumentDeckPresetActive, carouselNoteDensityUi, carouselSubjectModeUi]);

  useEffect(() => {
    if (!user?.id) return;
    
    // Prevent concurrent fetches
    if (fetchingPostingIdentitiesRef.current) return;
    
    // Skip if fetched recently
    const now = Date.now();
    if (now - lastPostingIdentitiesFetchRef.current < POSTING_IDENTITIES_CACHE_TTL) return;
    
    let cancelled = false;
    fetchingPostingIdentitiesRef.current = true;
    
    const loadPostingIdentities = async () => {
      try {
        setLoadingPostingIdentities(true);
        const response = await api.linkedin.postingIdentities();
        const identities = Array.isArray(response?.identities)
          ? response.identities
          : [];
        const defaultIdentityId = response?.defaultIdentityId;
        if (cancelled) return;
        setPostingIdentities(identities);
        lastPostingIdentitiesFetchRef.current = Date.now();
        if (identities.length > 0) {
          setSelectedPostingIdentityId((prev) => {
            if (prev && identities.some((i: PostingIdentity) => i.id === prev)) {
              return prev;
            }
            return (
              defaultIdentityId ||
              identities[0]?.id ||
              ""
            );
          });
        } else {
          setSelectedPostingIdentityId("");
        }
      } catch (error) {
        if (!cancelled) {
          setPostingIdentities([]);
          setSelectedPostingIdentityId("");
        }
      } finally {
        fetchingPostingIdentitiesRef.current = false;
        if (!cancelled) {
          setLoadingPostingIdentities(false);
        }
      }
    };
    void loadPostingIdentities();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const selectedPostingIdentity =
    postingIdentities.find((identity) => identity.id === selectedPostingIdentityId) ||
    postingIdentities[0] ||
    null;

  const mapTrendingItems = useCallback((items: unknown[], startRank: number) => {
    const list = Array.isArray(items) ? items : [];
    return list
      .map((raw, index) => {
        const item = raw as TrendingHashtag & { tag?: string };
        const rank = startRank + index + 1;
        const trend: "up" | "down" | "stable" =
          rank <= 5 ? "up" : rank <= 12 ? "stable" : "down";
        const tagText = String(item.hashtag || item.tag || "").trim();
        return {
          tag: tagText,
          count: Number(item.usage_count || 0),
          score: Number(item.score || 0),
          trend,
          rank,
          source_breakdown: item.source_breakdown,
        };
      })
      .filter((row) => row.tag.length > 0);
  }, []);

  const fetchTrendingTotalCount = useCallback(async () => {
    try {
      const response = await api.content.trending({ limit: 1, offset: 0 });
      const envelope = response?.data as { total?: number } | undefined;
      if (envelope && typeof envelope.total === "number") {
        setTrendingTotal(envelope.total);
        return;
      }
      // Ignore legacy array shape here; total should come from paginated envelope only.
      if (Array.isArray(response?.data)) {
        setTrendingTotal(null);
      }
    } catch {
      setTrendingTotal(null);
    }
  }, []);

  useEffect(() => {
    void fetchTrendingTotalCount();
  }, [fetchTrendingTotalCount]);

  useEffect(() => {
    const handler = () => {
      setShowTourDemo(true);
      setTourDemoStep("idle");
    };
    window.addEventListener(
      "trndinn:tour-enter-agent-demo",
      handler as EventListener,
    );
    return () =>
      window.removeEventListener(
        "trndinn:tour-enter-agent-demo",
        handler as EventListener,
      );
  }, []);

  // Helper function to calculate credit cost
  const calculateCreditCost = (content: any, isScheduling: boolean = false) => {
    const hasValidImage = content?.visual_url?.startsWith('http') || 
                         (content?.media_urls && content.media_urls.length > 0) ||
                         uploadedImages.length > 0;
    const hasCarousel = content?.carousel_urls && content.carousel_urls.length > 0;
    
    if (hasCarousel) {
      return isScheduling ? 15 : 12;
    } else if (hasValidImage) {
      return isScheduling ? 7.5 : 6;
    } else {
      return isScheduling ? 4 : 2.5;
    }
  };
  const { displayProgress, setTarget } = useSmoothProgress();

  // Function declarations (moved before handleComplete to avoid hoisting issues)
  const fetchGeneratedContentByJobId = useCallback(async (jobId: string | null): Promise<boolean> => {
    if (!jobId || !user?.id) {
      console.log('Cannot fetch content: jobId =', jobId, 'user.id =', user?.id);
      return false;
    }
    
    console.log('Fetching generated content for jobId:', jobId, 'userId:', user.id);
    
    try {
      const content = await dataService.getContentByJobId(jobId, user.id);
      console.log('Fetched content for current job:', content);
      setGeneratedContent(content);
      
      if (content.length === 0) {
        console.warn('No content found for job:', jobId);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error fetching generated content by job ID:', error);
      return false;
    }
  }, [user?.id]);

  const fetchRecentGenerations = useCallback(async (sourceOverride?: 'all' | 'viral' | 'custom', force = false) => {
    if (!user?.id) return;
    
    // Prevent concurrent fetches
    if (fetchingRecentGenerationsRef.current) return;
    
    // Skip if fetched recently (unless forced)
    const now = Date.now();
    if (!force && now - lastRecentGenerationsFetchRef.current < RECENT_GENERATIONS_CACHE_TTL) return;
    
    const src = sourceOverride ?? recentSourceFilter;
    fetchingRecentGenerationsRef.current = true;
    
    try {
      const paginatedData = await dataService.getPaginatedContent(user.id, 1, 3, src !== 'all' ? src : undefined);
      const posts = paginatedData.data || [];
      
      setRecentGenerations(posts);
      setTotalGenerationsCount(paginatedData.pagination.total || 0);
      lastRecentGenerationsFetchRef.current = Date.now();
    } catch (error) {
      console.error('Error fetching recent generations:', error);
      setRecentGenerations([]);
      setTotalGenerationsCount(0);
    } finally {
      fetchingRecentGenerationsRef.current = false;
    }
  }, [user?.id, recentSourceFilter]);

  const invalidateUserCache = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await dataService.invalidateUserCache(user.id);
    } catch (error) {
      console.error('Failed to invalidate cache:', error);
    }
  }, [user?.id]);

  const fetchContentById = useCallback(async (contentId: string): Promise<boolean> => {
    try {
      console.log('Fetching content by ID:', contentId);
      const content = await api.generation.contentById(contentId);
      console.log('Fetched content by ID:', content);
      
      if (content) {
        setGeneratedContent([dataService.normalizeGeneratedContent(content)]); // Set as array since our state expects an array
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching content by ID:', error);
      return false;
    }
  }, []);

  const fetchTrendingPage = useCallback(
    async (offset: number, append: boolean, signal?: AbortSignal) => {
      if (append) setLoadingMoreHashtags(true);
      else setLoadingHashtags(true);
      try {
        const response = await api.content.trending({ limit: 20, offset, signal });
        const d = response?.data as
          | {
              items?: TrendingHashtag[];
              total?: number;
              hasMore?: boolean;
            }
          | TrendingHashtag[]
          | undefined;
        let items: TrendingHashtag[] = [];
        let total = 0;
        let hasMore = false;
        if (Array.isArray(d)) {
          items = d;
          total = d.length;
        } else if (d && Array.isArray(d.items)) {
          items = d.items;
          total = typeof d.total === "number" ? d.total : items.length;
          hasMore = Boolean(d.hasMore);
        }
        const ranked = mapTrendingItems(items, append ? offset : 0);
        setPopularHashtags((prev) => (append ? [...prev, ...ranked] : ranked));
        setTrendingTotal(total);
        setTrendingHasMore(hasMore);
      } catch (error) {
        if (signal?.aborted || (error as Error)?.name === "AbortError") {
          return;
        }
        console.error("Error fetching popular hashtags:", error);
        toast.error("Could not load hashtags. Check connection and try again.");
        setTrendingHasMore(false);
      } finally {
        setLoadingHashtags(false);
        setLoadingMoreHashtags(false);
      }
    },
    [mapTrendingItems],
  );

  /** Load first page when the modal opens (single effect; avoids duplicate onOpenChange + StrictMode races). */
  useEffect(() => {
    if (!showHashtagsModal) {
      trendingModalSessionRef.current?.abort();
      trendingModalSessionRef.current = null;
      return;
    }
    const ac = new AbortController();
    trendingModalSessionRef.current = ac;
    void fetchTrendingPage(0, false, ac.signal);
    return () => {
      ac.abort();
      if (trendingModalSessionRef.current === ac) {
        trendingModalSessionRef.current = null;
      }
    };
  }, [showHashtagsModal, fetchTrendingPage]);

  const handleComplete = useCallback(
    async (contentId: string | null) => {
      console.log('🎯 COMPLETE! contentId:', contentId, 'jobId:', jobId);
      
      try {
        // Set loading state to prevent "Content Not Found" from showing
        setIsLoadingContent(true);
        setTarget(95);
        setStage("Loading content...");
        
        // Wait for DB consistency
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fetch content via authenticated API client
        if (!jobId) {
          throw new Error("Missing jobId for completion fetch");
        }
        const rawContent = await api.generation.jobContent(jobId);
        const content = Array.isArray(rawContent)
          ? rawContent.map((item: any) => dataService.normalizeGeneratedContent(item))
          : [];
        console.log('n8n data', content);
        console.log('Content received:', content.length, 'items');

        const inferType = (item: any): 'post' | 'image' | 'carousel' => {
          const perfSlides =
            item?.performance_prediction?.slides ||
            item?.performancePrediction?.slides;
          if (
            item?.carousel_urls?.length ||
            item?.visual_type === 'carousel' ||
            (Array.isArray(perfSlides) && perfSlides.length >= 2)
          ) {
            return 'carousel';
          }
          // Carousel run: n8n may still store visual_type=image before slides exist; never force single-image gen.
          if (selectedType === 'carousel') {
            return 'carousel';
          }
          if (item?.visual_url?.startsWith('http') || item?.visual_type === 'image') return 'image';
          return selectedType as 'post' | 'image' | 'carousel';
        };

        const buildCarouselSlides = (item: any) => {
          const perf =
            item?.performance_prediction ||
            item?.performancePrediction;
          const fromPerf = Array.isArray(perf?.slides) ? perf.slides : null;
          const topSlides = Array.isArray(item?.slides) ? item.slides : null;
          const slideSource = topSlides?.length ? topSlides : fromPerf;
          if (slideSource && slideSource.length > 0) {
            return slideSource.map((slide: any) => ({
              headline:
                slide.headline || item.title || 'Slide',
              body:
                slide.body ||
                String(item?.content || '').substring(0, 180) ||
                '',
              imagePrompt:
                slide.imagePrompt ||
                slide.image_prompt ||
                `Professional LinkedIn carousel slide for ${item.title || 'business topic'}`,
            }));
          }
          const sentences = String(item?.content || '')
            .split(/(?<=[.!?])\s+/)
            .filter(Boolean)
            .slice(0, 4);
          const base = sentences.length > 0 ? sentences : [String(item?.content || '').slice(0, 220)];
          const title = item?.title || 'Key Insight';
          const headlineSuffixes = ['Overview', 'Deep Dive', 'Key Takeaway', 'The Bigger Picture', 'In Practice', 'Next Steps'];
          return base.map((body: string, idx: number) => ({
            headline: idx === 0
              ? title
              : `${title.split(/[:\-–—]/)[0].trim().slice(0, 40)} — ${headlineSuffixes[idx % headlineSuffixes.length]}`,
            body: body.slice(0, 220),
            imagePrompt: `Professional LinkedIn carousel slide about ${title}: ${body.slice(0, 120)}`,
          }));
        };

        const pollCarouselJob = async (mediaJobId: string, item: any): Promise<any> => {
          const existing = activeCarouselPollsRef.current.get(mediaJobId);
          if (existing) return existing;

          const pollPromise = (async () => {
            const intervals = [1200, 1800, 2500, 3500, 5000, 5000, 6000, 6000];
            const MAX_POLLS = 25;
            for (let i = 0; i < MAX_POLLS; i++) {
              const wait = intervals[Math.min(i, intervals.length - 1)];
              await new Promise((r) => setTimeout(r, wait));
              try {
                const status = await api.media.getCarouselJobStatus(mediaJobId);
                const pct = typeof status.progress === 'number' ? status.progress : 0;
                setTarget(Math.min(92, 60 + Math.round(pct * 0.32)));

                if (status.status === 'completed') {
                  const imageUrls: string[] = Array.isArray(status?.result?.imageUrls)
                    ? status.result.imageUrls
                    : [];
                  if (imageUrls.length > 0) {
                    return {
                      ...item,
                      visual_type: 'carousel',
                      carousel_urls: imageUrls,
                    };
                  }
                  const freshContent = await api.generation.contentById(item.id);
                  return dataService.normalizeGeneratedContent(freshContent);
                }
                if (status.status === 'failed') {
                  throw new Error(status.error || 'Carousel generation failed');
                }
              } catch (pollErr: any) {
                if (pollErr?.message?.includes('not found')) continue;
                throw pollErr;
              }
            }
            throw new Error('Carousel generation timed out');
          })();

          activeCarouselPollsRef.current.set(mediaJobId, pollPromise);
          try {
            return await pollPromise;
          } finally {
            activeCarouselPollsRef.current.delete(mediaJobId);
          }
        };

        const ensureMediaForContent = async (item: any) => {
          const itemType = inferType(item);
          if (itemType === 'post') return item;

          if (itemType === 'image' && !item?.visual_url?.startsWith('http')) {
            await api.media.generateImage({
              contentId: item.id,
              prompt: item?.imagePrompt || `Professional LinkedIn visual for: ${item?.title || 'this post'}`,
            });
          }

          if (itemType === 'carousel' && !(item?.carousel_urls?.length > 0)) {
            const slides = buildCarouselSlides(item);
            const perf =
              item?.performance_prediction || item?.performancePrediction;
            const visualStyle =
              typeof perf?.visualStyle === 'string' ? perf.visualStyle : undefined;
            const asyncRes = await api.media.generateCarouselAsync({
              contentId: item.id,
              slides,
              includePdf: true,
              ...(visualStyle ? { style: visualStyle } : {}),
            });
            if (asyncRes?.jobId) {
              return pollCarouselJob(String(asyncRes.jobId), item);
            }
          }

          const refreshed = await api.generation.contentById(item.id);
          return dataService.normalizeGeneratedContent(refreshed);
        };

        let finalizedContent = content;
        if (content.length > 0 && selectedType !== 'post') {
          setTarget(92);
          setStage(
            selectedType === 'image'
              ? 'Generating image...'
              : 'Generating carousel...'
          );
          try {
            finalizedContent = await Promise.all(
              content.map((item: any) => ensureMediaForContent(item)),
            );
          } catch (mediaError: any) {
            console.error('Media generation step failed:', mediaError);
            finalizedContent = content;
            setStage('Content ready (media pending)');
            toast.error(
              mediaError?.message?.includes('503')
                ? 'Media service unavailable right now. Text is ready; media can be generated on publish.'
                : 'Media generation failed for now. Text is ready; you can still continue.',
            );
          }
        }

        // Update all states
        setGeneratedContent(
          finalizedContent.map((item: any) => dataService.normalizeGeneratedContent(item)),
        );
        setTarget(100);
        setIsComplete(true);
        setIsGenerating(false);
        setIsLoadingContent(false);
        setStage("Completed");
        
        if (finalizedContent.length > 0) {
          toast.success(`Generated ${finalizedContent.length} content piece(s)!`);
        } else {
          toast.error("Content not found. Please try refresh.");
        }
        
        setTimeout(() => setJobId(null), 5000);
        fetchRecentGenerations(undefined, true); // Force refresh after generation complete
        await refreshQuota(true); // Force refresh credits everywhere (sidebar, header, dashboard, billing)
      } catch (error) {
        console.error('Error in handleComplete:', error);
        if (generatedContent.length > 0) {
          setIsComplete(true);
          setIsGenerating(false);
          setIsLoadingContent(false);
          setStage("Completed");
          return;
        }
        setTarget(100);
        setIsComplete(true);
        setIsGenerating(false);
        setIsLoadingContent(false);
        setStage("Error");
        toast.error("Failed to load content");
      }
    },
    [setTarget, jobId, fetchRecentGenerations, refreshQuota, selectedType]
  );

  const handleFailed = useCallback(
    (error: string | null) => {
      console.warn('Job failed:', error);
      setIsGenerating(false);
      setIsComplete(true); // Mark as complete so we can show retry
      setIsFailed(true); // Mark as failed
      setTarget(0);
      setStage("Failed");
      setCustomProgressStartedAt(null);
      // Preserve current step list so late SSE events can still settle the UI
      // (e.g. timeout fires but slides finished a few seconds later). The list
      // is reset cleanly when the user starts a new generation.
      setCustomProgressSteps(prev =>
        prev.map(s =>
          s.status === 'pending' || s.status === 'running'
            ? { ...s, status: 'failed' as ProgressStepStatus }
            : s,
        ),
      );
      setGeneratedContent([]); // Clear any previous content
      toast.error(`Generation failed: ${error || 'Unknown error'}. You can retry.`);
    },
    [setTarget]
  );

  // Format stage labels for better UX
  const formatStageLabel = (stage: string | null): string => {
    if (!stage) return '';
    const stageLabels: Record<string, string> = {
      'initializing': 'Initializing...',
      'validating': 'Validating topic...',
      'reserving_credits': 'Reserving credits...',
      'generating_text': 'Generating text...',
      'enhancing_text': 'Enhancing & expanding...',
      'composing_pages': 'Planning slides...',
      'planning_slides': 'Planning slides...',
      'saving': 'Saving to storage...',
      'done': 'Done!',
      'topic_discovery': 'Discovering trending topics...',
      'n8n_triggered': 'AI workflow started...',
      'waiting_for_callback': 'Generating content...',
      'content_generation': 'Creating your content...',
      'image_generation': 'Generating images...',
      'carousel_generation': 'Building carousel slides...',
      'finalizing': 'Finalizing content...',
    };
    return stageLabels[stage] || stage.replace(/_/g, ' ');
  };

  const handleProgress = useCallback((progress: number, currentStage: string | null) => {
    setTarget(progress);
    setStage(formatStageLabel(currentStage));
  }, [setTarget]);

  useGenerationJob({
    jobId,
    contentType: selectedType as 'text' | 'image' | 'carousel',
    slideCount: selectedType === 'carousel' ? slideCount : undefined,
    onComplete: handleComplete,
    onFailed: handleFailed,
    onProgress: handleProgress,
  });


  useEffect(() => {
    if (user?.id) {
      // Guard against React StrictMode double-invocation in dev.
      if (hasLoadedRecentRef.current === user.id) return;
      hasLoadedRecentRef.current = user.id;
      fetchRecentGenerations();
    }
  }, [user?.id, fetchRecentGenerations]);


  const generateViralTopics = async () => {
    if (isGenerating) {
      toast.error("A job is already running. Please wait for it to complete.");
      return;
    }

    // Check if user has enough credits
    if (userQuota && userQuota.usedCredits + 1.5 > userQuota.totalCredits) {
      toast.error("Insufficient credits. Content generation requires 1.5 credits. Please upgrade your plan.", {
        duration: 5000,
      });
      return;
    }

    setIsGenerating(true);
    setTarget(0);
    setStage("Starting topic generation...");
    setIsComplete(false);
    setIsFailed(false); // Reset failed state
    setGeneratedContent([]);
    setCurrentJobId(null); // Clear previous job ID

    try {
      const data = await api.generation.start({
        jobType: 'generate_topics',
        count: 5,
        contentType: 'topics',
      });
      
      // Refresh quota after successful start
      await refreshQuota(true);
      
      if (data.jobId) {
        setJobId(data.jobId);
        setCurrentJobId(data.jobId); // Store current job ID for tracking
        setTarget(5); // Initial optimistic progress
        toast.success("Topic generation started!");
        
        // Simulate progressive updates for better UX
        setTimeout(() => setTarget(15), 2000);
        setTimeout(() => setTarget(25), 5000);
        setTimeout(() => setTarget(40), 8000);
      }
      
    } catch (error) {
      console.error('Error generating topics:', error);
      
      // Handle insufficient credits error
      if (error.message?.includes('Insufficient credits')) {
        toast.error("Not enough credits. Content generation requires 1.5 credits. Please upgrade your plan.", {
          duration: 5000,
        });
      } else {
        toast.error(error.message || "Failed to start topic generation. Please try again.");
      }
      
      setIsGenerating(false);
      setTarget(0);
      setStage(null);
      
      // Refresh quota to get updated balance
      await refreshQuota(true);
    }
  };

  const handleGenerate = async () => {
    // Trending mode: first request usually lists topics via the default n8n workflow.
    // Carousel uses a separate full-pipeline workflow (news → slides); skip the topic-only
    // step so we do not always hit N8N_WEBHOOK_URL with contentType "topics".
    if (generationMode === 'trending' && generatedContent.length === 0) {
      if (selectedType !== 'carousel') {
        await generateViralTopics();
        return;
      }
      // Carousel + trending: one shot → N8N_CAROUSEL_WEBHOOK_URL (contentType carousel)
    }

    if (isGenerating) {
      toast.error("A job is already running. Please wait for it to complete.");
      return;
    }

    if (generationMode === 'custom' && !customTopic.trim()) {
      toast.error("Please enter a topic to generate content");
      return;
    }

    if (
      generationMode === 'trending' &&
      selectedTrending === null &&
      selectedType !== 'carousel'
    ) {
      toast.error("Please select a viral topic first");
      return;
    }

    setIsGenerating(true);
    setTarget(0);
    setStage("Starting content generation...");
    setIsComplete(false);
    setIsFailed(false); // Reset failed state
    setGeneratedContent([]); // Clear previous generated content
    setCurrentJobId(null); // Clear previous job ID
    
    try {
      const topic = generationMode === 'custom' 
        ? customTopic 
        : generatedContent.find(t => t.id === selectedTrending)?.title || '';

      const data = await api.generation.start({
        topic,
        contentType: selectedType,
        jobType: 'generate_content',
        source: generationMode === 'trending' ? 'trending' : 'custom',
      });
      
      if (data.jobId) {
        setJobId(data.jobId);
        setTarget(15); // Initial optimistic progress
        toast.success("Content generation started!");
      }
      
      // Reset form
      setCustomTopic('');
      setSelectedTrending(null);
      
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.message || "Failed to generate content. Please try again.");
      setIsGenerating(false);
      setTarget(0);
      setStage(null);
    }
  };

  const handleCustomTopicGenerate = async () => {
    if (isGenerating) {
      toast.error("A job is already running. Please wait for it to complete.");
      return;
    }

    if (!customTopic.trim() || customTopic.trim().length < 3) {
      toast.error("Please enter a topic (at least 3 characters)");
      return;
    }

    if (userQuota && userQuota.remainingCredits < customTopicCreditCost) {
      toast.error(`Insufficient credits. This generation requires ${customTopicCreditCost} credits.`, { duration: 5000 });
      return;
    }

    setIsGenerating(true);
    setTarget(0);
    setStage("Starting custom topic generation...");
    setIsComplete(false);
    setIsFailed(false);
    setGeneratedContent([]);
    setCurrentJobId(null);
    sseEventBufferRef.current.clear(); // Clear any stale buffered events
    setCustomProgressSteps(buildProgressSteps());
    setCustomProgressStartedAt(Date.now());
    setCarouselStyleStatusLabel(null);

    try {
      const data = await api.generation.customTopic({
        topic: customTopic,
        platform: 'linkedin',
        contentType: mapAgentContentTypeToApi(selectedType),
        tonality: mapTonalityUiToApi(tonality),
        wordLimit: wordLimitKind === 'custom'
          ? { kind: 'custom', words: customWordCount }
          : { kind: wordLimitKind },
        ...(selectedType === 'image' ? { imageCount } : {}),
        ...(selectedType === 'carousel'
          ? {
              slideCount,
              carouselVisualStyle,
              ...(carouselNoteDensityUi !== 'auto'
                ? { carouselNoteDensity: carouselNoteDensityUi }
                : {}),
              ...(carouselSubjectModeUi !== 'auto'
                ? { carouselSubjectMode: carouselSubjectModeUi }
                : {}),
              ...(tonality === 'educational' && carouselDocumentModeUi !== 'auto'
                ? { carouselDocumentMode: carouselDocumentModeUi }
                : {}),
              ...(trainingDatasetOptIn ? { trainingDataCaptureOptIn: true } : {}),
            }
          : {}),
      });

      await refreshQuota(true);

      if (data.jobId) {
        setJobId(data.jobId);
        setCurrentJobId(data.jobId);
        setTarget(15);
        toast.success("Custom topic generation started!");
      }

      setCustomTopic('');
    } catch (error: any) {
      console.error('Custom topic generation error:', error);

      if (error?.message?.includes('429') || error?.message?.includes('max_in_flight') || error?.message?.includes('Too Many')) {
        toast.error("You have too many active generations. Please wait for one to complete.", { duration: 5000 });
      } else if (error?.message?.includes('402') || error?.message?.includes('Insufficient credits')) {
        toast.error("Insufficient credits. Please upgrade your plan.", { duration: 5000 });
      } else if (error?.message?.includes('profanity')) {
        toast.error("Content contains inappropriate language. Please modify your topic.");
      } else if (error?.message?.includes('off_topic') || error?.message?.includes('off-topic')) {
        toast.error("Please describe a topic, event, or experience for your post.");
      } else {
        toast.error(error?.message || "Failed to generate. Please try again.");
      }

      setIsGenerating(false);
      setTarget(0);
      setStage(null);
      await refreshQuota(true);
    }
  };

  const previewContent = (selectedContent?.content ?? "")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1: $2")
    .replace(/\((https?:\/\/[^\s)]+)\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Publishing functions
  const handlePublishNow = async (content: any) => {
    try {
      setIsPublishing(true);

      const actionType: 'post' | 'image' | 'carousel' =
        content?.carousel_urls?.length || content?.visual_type === 'carousel'
          ? 'carousel'
          : content?.visual_url?.startsWith('http') || content?.visual_type === 'image'
            ? 'image'
            : (selectedType as 'post' | 'image' | 'carousel');

      // First generate media if needed
      if (actionType === 'image' && !content?.visual_url?.startsWith('http')) {
        const mediaResponse = await apiClient.post('/media/generate-image', {
          prompt: content.imagePrompt || content.visual?.imagePrompt || `Professional image for: ${content.title}`,
          contentId: content.id,
        });
        
        if (!mediaResponse.success) {
          throw new Error('Failed to generate image');
        }
      } else if (
        actionType === 'carousel' &&
        (!(content?.carousel_urls?.length > 0) || !content?.pdf_url)
      ) {
        const slides = Array.isArray(content?.slides) && content.slides.length > 0
          ? content.slides
          : [
              {
                headline: content.title,
                body: content.content.substring(0, 160),
                imagePrompt: `Professional image for: ${content.title}`,
              },
            ];
        
        const mediaResponse = await apiClient.post('/media/generate-carousel', {
          slides,
          contentId: content.id,
          includePdf: true,
        });
        
        if (!mediaResponse.success) {
          throw new Error('Failed to generate carousel');
        }
      }

      // Publish the post
      const publishResponse = await apiClient.post('/posts/publish', {
        contentId: content.id,
        platform: 'linkedin',
        actorType: selectedPostingIdentity?.actorType,
        organizationUrn: selectedPostingIdentity?.organizationUrn,
      });

      if (publishResponse.success) {
        toast.success('Post published successfully to LinkedIn!');
        fetchRecentGenerations(undefined, true); // Force refresh after publish
        refreshQuota(true); // IMMEDIATE QUOTA REFRESH (forced)
        dispatchFeedbackEligibilityRefresh();
      } else {
        throw new Error(publishResponse.message || 'Failed to publish post');
      }
    } catch (error) {
      console.error('Publishing error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to publish post';
      
      if (errorMessage.includes('Insufficient credits') || errorMessage.includes('upgrade your plan')) {
        toast.error(errorMessage, { duration: 5000 });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!selectedContentForAction || !scheduleDateTime) {
      toast.error('Please select a date and time');
      return;
    }

    try {
      setIsScheduling(true);
      
      const actionType: 'post' | 'image' | 'carousel' =
        selectedContentForAction?.carousel_urls?.length || selectedContentForAction?.visual_type === 'carousel'
          ? 'carousel'
          : selectedContentForAction?.visual_url?.startsWith('http') || selectedContentForAction?.visual_type === 'image'
            ? 'image'
            : (selectedType as 'post' | 'image' | 'carousel');

      // First generate media if needed
      if (actionType === 'image' && !selectedContentForAction?.visual_url?.startsWith('http')) {
        const mediaResponse = await apiClient.post('/media/generate-image', {
          prompt: selectedContentForAction.imagePrompt || selectedContentForAction.visual?.imagePrompt || `Professional image for: ${selectedContentForAction.title}`,
          contentId: selectedContentForAction.id,
        });
        
        if (!mediaResponse.success) {
          throw new Error('Failed to generate image');
        }
      } else if (
        actionType === 'carousel' &&
        (
          !(selectedContentForAction?.carousel_urls?.length > 0) ||
          !selectedContentForAction?.pdf_url
        )
      ) {
        const slides =
          Array.isArray(selectedContentForAction?.slides) &&
          selectedContentForAction.slides.length > 0
            ? selectedContentForAction.slides
            : [
                {
                  headline: selectedContentForAction.title,
                  body: selectedContentForAction.content.substring(0, 160),
                  imagePrompt: `Professional image for: ${selectedContentForAction.title}`,
                },
              ];
        
        const mediaResponse = await apiClient.post('/media/generate-carousel', {
          slides,
          contentId: selectedContentForAction.id,
          includePdf: true,
        });
        
        if (!mediaResponse.success) {
          throw new Error('Failed to generate carousel');
        }
      }

      // Schedule the post
      const scheduleResponse = await apiClient.post('/posts/schedule', {
        contentId: selectedContentForAction.id,
        scheduledFor: scheduleDateTime,
        timezone: userTimezone,
        platform: 'linkedin',
        actorType: selectedPostingIdentity?.actorType,
        organizationUrn: selectedPostingIdentity?.organizationUrn,
      });

      if (scheduleResponse.success) {
        const scheduledTime = formatInTimezone(scheduleDateTime, userTimezone);
        toast.success(`Post scheduled for ${scheduledTime} (${userTimezone})`);
        setScheduleDateTime('');
        setSelectedContentForAction(null);
        fetchRecentGenerations(undefined, true); // Force refresh after schedule
        refreshQuota(true); // IMMEDIATE QUOTA REFRESH (forced)
        dispatchFeedbackEligibilityRefresh();
      } else {
        throw new Error(scheduleResponse.message || 'Failed to schedule post');
      }
    } catch (error) {
      console.error('Scheduling error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to schedule post';
      
      if (errorMessage.includes('Insufficient credits') || errorMessage.includes('upgrade your plan')) {
        toast.error(errorMessage, { duration: 5000 });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsScheduling(false);
    }
  };

  const startPostingAction = (action: "publish" | "schedule", content: any) => {
    if (hasConfirmedPostingIdentity) {
      if (action === "publish") {
        void handlePublishNow(content);
      } else {
        setSelectedContent(content);
        setShowContentModal(true);
        setIsSchedulingExpanded(true);
        setEditedContent(content.content || '');
        setEditedHashtags(content.hashtags || []);
        setUploadedImages(content.media_urls || []);
      }
      return;
    }
    setPendingPostAction(action);
    setPendingActionContent(content);
    setShowPostingAccountModal(true);
  };

  const confirmPostingAction = async () => {
    if (!pendingPostAction || !pendingActionContent) {
      setShowPostingAccountModal(false);
      return;
    }
    const action = pendingPostAction;
    const content = pendingActionContent;
    setShowPostingAccountModal(false);
    setPendingPostAction(null);
    setPendingActionContent(null);
    setHasConfirmedPostingIdentity(true);

    if (action === "publish") {
      await handlePublishNow(content);
      return;
    }

    setSelectedContent(content);
    setShowContentModal(true);
    setIsSchedulingExpanded(true);
    setEditedContent(content.content || '');
    setEditedHashtags(content.hashtags || []);
    setUploadedImages(content.media_urls || []);
  };

  return (
    <div className="flex-1 space-y-4 sm:space-y-6">
      {(isPublishing || isScheduling) && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="rounded-xl border bg-card px-6 py-5 shadow-lg min-w-[280px] text-center">
            <RefreshCw className="h-6 w-6 mx-auto mb-3 animate-spin text-primary" />
            <p className="font-medium">
              {isPublishing ? "Publishing post..." : "Scheduling post..."}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Please wait while we complete this action.
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">AI Content Agent</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Generate strategic content from trending topics or custom ideas</p>
        </div>
        <Badge 
          variant={
            userQuota && getQuotaColor(userQuota.percentageUsed) === 'red' 
              ? 'destructive' 
              : userQuota && getQuotaColor(userQuota.percentageUsed) === 'orange'
              ? 'secondary'
              : 'default'
          } 
          className="gap-1 shrink-0 whitespace-nowrap w-fit"
        >
          <Sparkles className="h-3 w-3" /> 
          {loadingQuota ? 'Loading...' : userQuota ? `${userQuota.remainingCredits} Credits Available` : '-- Credits Available'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-7 gap-4 md:gap-6">
        {/* Generation Panel */}
        <div className="lg:col-span-3 xl:col-span-4 space-y-4 md:space-y-6">
          {/* Content Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Content Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {contentTypes.map((type) => (
                  <div
                    key={type.id}
                    className={cn(
                      "p-2 sm:p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md",
                      selectedType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <type.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <h3 className="font-medium text-[10px] sm:text-xs md:text-sm whitespace-nowrap">{type.label}</h3>
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block leading-tight mt-1">{type.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generation Mode Tabs */}
          <Card>
            <CardHeader>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={generationMode === 'trending' ? 'default' : 'outline'}
                    onClick={() => setGenerationMode('trending')}
                    className={cn("w-full text-xs sm:text-sm", generationMode === 'trending' && "bg-primary text-primary-foreground")}
                    size="sm"
                  >
                    <TrendingUp className="h-3.5 w-3.5 sm:mr-1.5 shrink-0" />
                    <span className="truncate">Find Viral Topic</span>
                  </Button>
                  <Button
                    variant={generationMode === 'custom' ? 'default' : 'outline'}
                    onClick={() => setGenerationMode('custom')}
                    className={cn("w-full text-xs sm:text-sm", generationMode === 'custom' && "bg-primary text-primary-foreground")}
                    size="sm"
                  >
                    <Globe className="h-3.5 w-3.5 sm:mr-1.5 shrink-0" />
                    <span className="truncate">Custom Topic</span>
                  </Button>
                </div>
            </CardHeader>
            <CardContent>
              {generationMode === 'trending' ? (
                <div className="space-y-4">
                  {/* Onboarding Tour Demo (dummy) */}
                  {showTourDemo && (
                    <div data-tour="tour-demo-generation">
                    <Card className="border-primary/30 bg-primary/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                          <Wand2 className="h-4 w-4 text-primary" />
                          Tour demo: generate & schedule (no credits)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          This is a safe, fake example so you can see the flow end-to-end.
                        </div>

                        {tourDemoStep === "idle" && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setTourDemoStep("generated");
                                window.dispatchEvent(new CustomEvent("trndinn:tour-next"));
                              }}
                            >
                              Generate demo post
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.dispatchEvent(new CustomEvent("trndinn:tour-next"))
                              }
                            >
                              Skip demo
                            </Button>
                          </div>
                        )}

                        {tourDemoStep !== "idle" && (
                          <div className="rounded-lg border bg-background p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-sm font-semibold truncate">
                                  How to write a viral LinkedIn post
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  Demo content • safe preview
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                Demo
                              </Badge>
                            </div>
                            <div className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-3">
                              Hook → value → proof → CTA. This is a dummy example for onboarding only.
                            </div>
                            <div className="mt-3 flex flex-col sm:flex-row gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowContentModal(true);
                                  setSelectedContent({
                                    id: "tour-demo",
                                    title: "How to write a viral LinkedIn post",
                                    content:
                                      "Hook → value → proof → CTA.\n\nThis is a dummy example for onboarding only.",
                                    ai_score: 9.2,
                                    hashtags: ["#linkedin", "#writing", "#personalbrand"],
                                  });
                                }}
                              >
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setTourDemoStep("scheduled");
                                  window.dispatchEvent(new CustomEvent("trndinn:tour-next"));
                                }}
                              >
                                Schedule (demo)
                              </Button>
                            </div>
                            {tourDemoStep === "scheduled" && (
                              <div className="mt-3 text-xs sm:text-sm text-green-600 dark:text-green-400">
                                Scheduled (demo). Next we’ll show how to manage scheduled posts.
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    </div>
                  )}

                  {/* Progress Display - Trending mode (generic) */}
                  {isGenerating && (
                    <div className="text-center py-6">
                      <div className="mb-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          {isComplete ? (
                            <CheckCircle2 className="h-8 w-8 text-primary" />
                          ) : (
                            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                          )}
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          {isComplete
                            ? "Generation Complete!"
                            : generatedContent.length === 0
                              ? "Generating Viral Topics"
                              : selectedType === 'post'
                                ? "Generating Text Post"
                                : selectedType === 'image'
                                  ? "Generating Image Post"
                                  : "Generating Carousel Post"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {stage || "AI is analyzing trending content and generating viral topics for you..."}
                        </p>
                        <div className="w-full max-w-md mx-auto">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{Math.round(displayProgress)}%</span>
                          </div>
                          <Progress value={displayProgress} className="h-2" />
                        </div>
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            <span className="capitalize">{isComplete ? "Completed" : "Processing"}</span>
                            {stage && (
                              <>
                                <span>•</span>
                                <span className="text-muted-foreground">{stage}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Failed Job Message */}
                  {isComplete && generatedContent.length === 0 && isFailed && (
                    <div className="space-y-4">
                      <div className="p-6 border-2 border-destructive/20 bg-destructive/5 rounded-lg text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                            <X className="h-6 w-6 text-destructive" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-destructive mb-1">Generation Failed</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {stage === "Failed" ? "The AI workflow encountered an error." : "Something went wrong during content generation."}
                            </p>
                            <div className="flex gap-2 justify-center">
                              <Button 
                                variant="default"
                                size="sm"
                                onClick={async () => {
                                  if (currentJobId) {
                                    console.log('🔄 Retrying job:', currentJobId);
                                    setIsFailed(false);
                                    setIsComplete(false);
                                    setIsGenerating(true);
                                    setTarget(5);
                                    setStage("Retrying...");
                                    
                                    try {
                                      const result = await api.generation.retry(currentJobId);
                                      if (result?.jobId) {
                                        setJobId(result.jobId);
                                        setCurrentJobId(result.jobId);
                                        toast.success("Retrying content generation...");
                                      } else {
                                        throw new Error('Retry failed');
                                      }
                                    } catch (error) {
                                      console.error('Retry error:', error);
                                      setIsGenerating(false);
                                      setIsFailed(true);
                                      toast.error("Failed to retry. Please try again.");
                                    }
                                  }
                                }}
                                disabled={!currentJobId}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry Generation
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setIsComplete(false);
                                  setIsFailed(false);
                                  setCurrentJobId(null);
                                  setJobId(null);
                                }}
                              >
                                Start New
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* No Content Found Message (non-failed) */}
                  {isComplete && generatedContent.length === 0 && !isFailed && !isLoadingContent && (
                    <div className="space-y-4">
                      <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <SearchX className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">Content Not Found</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              The job completed but content is not showing. This might be a timing issue.
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                console.log('Manual refresh clicked, currentJobId:', currentJobId);
                                if (currentJobId) {
                                  fetchGeneratedContentByJobId(currentJobId);
                                }
                              }}
                              disabled={!currentJobId}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refresh Content
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generated Content Display */}
                  {isComplete && generatedContent.length > 0 && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="rounded-lg border p-2.5 sm:p-3 bg-muted/20">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <div className="text-xs sm:text-sm font-medium">Posting identity</div>
                          <select
                            className="h-8 sm:h-9 rounded-md border bg-background px-2.5 text-xs sm:text-sm min-w-0 sm:min-w-[260px]"
                            value={selectedPostingIdentityId}
                            onChange={(e) => setSelectedPostingIdentityId(e.target.value)}
                            disabled={loadingPostingIdentities || postingIdentities.length === 0}
                          >
                            {postingIdentities.length === 0 ? (
                              <option value="">
                                {loadingPostingIdentities ? "Loading identities..." : "Personal profile"}
                              </option>
                            ) : (
                              postingIdentities.map((identity) => (
                                <option key={identity.id} value={identity.id}>
                                  {identity.actorType === "organization"
                                    ? `Company Page: ${identity.label}`
                                    : `Personal: ${identity.label}`}
                                </option>
                              ))
                            )}
                          </select>
                          {selectedPostingIdentity?.actorType === "organization" && (
                            <Badge variant="outline" className="w-fit text-[10px] sm:text-xs">
                              Posting as company page
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          <span className="hidden sm:inline">Generated content from this job - click to view</span>
                          <span className="sm:hidden">Generated content - tap to view</span>
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() =>
                            selectedType === 'carousel'
                              ? handleGenerate()
                              : generateViralTopics()
                          }
                          disabled={isGenerating}
                          className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          <span className="hidden sm:inline">Generate New Content</span>
                          <span className="sm:hidden">Generate New</span>
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {generatedContent.map((content) => (
                          <div
                            key={content.id}
                            className="p-3 sm:p-4 border-2 rounded-lg transition-all hover:shadow-md border-border bg-card"
                          >
                            {/* Header Section */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 
                                className="font-semibold text-sm sm:text-base line-clamp-2 flex-1 cursor-pointer hover:text-primary transition-colors"
                                onClick={() => {
                                  setShowContentModal(true);
                                  setSelectedContent(content);
                                }}
                              >
                                {content.title || 'Generated Content'}
                              </h3>
                              <Badge variant="outline" className="shrink-0 text-xs">
                                {content.ai_score || 'N/A'}
                              </Badge>
                            </div>

                            {/* Content Preview */}
                            <p 
                              className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2 cursor-pointer hover:text-foreground transition-colors"
                              onClick={() => {
                                setShowContentModal(true);
                                setSelectedContent(content);
                              }}
                            >
                              {content.content?.substring(0, 120)}...
                            </p>

                            {/* Metadata Row */}
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
                              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                                {selectedType === 'post' ? 'Text' : selectedType === 'image' ? 'Image' : 'Carousel'}
                              </Badge>
                              <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                                <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="hidden sm:inline">Generated</span>
                                <span className="sm:hidden">Gen</span>
                              </Badge>
                              <span className="hidden sm:inline text-xs text-muted-foreground">•</span>
                              <span className="hidden md:inline text-xs text-muted-foreground truncate max-w-[120px]">
                                {content.job_id?.substring(0, 8)}...
                              </span>
                              <span className="hidden sm:inline text-xs text-muted-foreground">•</span>
                              <button
                                className="text-[10px] sm:text-xs text-primary hover:underline cursor-pointer"
                                onClick={() => {
                                  setShowContentModal(true);
                                  setSelectedContent(content);
                                }}
                              >
                                View full
                              </button>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-9"
                                onClick={() => startPostingAction("publish", content)}
                                disabled={isPublishing}
                              >
                                {isPublishing ? (
                                  <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 animate-spin" />
                                ) : (
                                  <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                                )}
                                <span className="truncate flex items-center">
                                  {isPublishing ? 'Publishing...' : (
                                    <>
                                      <span className="hidden sm:inline flex items-center">
                                        Post now ({calculateCreditCost(content, false)} <Coins className="h-3 w-3 ml-0.5 inline" />)
                                      </span>
                                      <span className="sm:hidden flex items-center">
                                        Post ({calculateCreditCost(content, false)} <Coins className="h-2.5 w-2.5 ml-0.5 inline" />)
                                      </span>
                                    </>
                                  )}
                                </span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-9"
                                onClick={() => startPostingAction("schedule", content)}
                                disabled={isScheduling}
                              >
                                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                                <span className="truncate flex items-center">
                                  <span className="hidden sm:inline flex items-center">
                                    Schedule ({calculateCreditCost(content, true)} <Coins className="h-3 w-3 ml-0.5 inline" />)
                                  </span>
                                  <span className="sm:hidden flex items-center">
                                    Schedule ({calculateCreditCost(content, true)} <Coins className="h-2.5 w-2.5 ml-0.5 inline" />)
                                  </span>
                                </span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Initial State - No topics generated yet */}
                  {!isGenerating && !isComplete && (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Generate Viral Topics</h3>
                        <p className="text-sm text-muted-foreground">
                          Click the button below to generate trending topics using AI
                        </p>
                      </div>
                      <Button 
                        onClick={() =>
                          selectedType === 'carousel'
                            ? handleGenerate()
                            : generateViralTopics()
                        }
                        disabled={isGenerating}
                        className="bg-primary text-primary-foreground"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {selectedType === 'carousel'
                          ? 'Generate carousel'
                          : 'Generate Viral Topics'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Label htmlFor="custom-topic" className="text-xs font-medium">
                        Topic
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 shrink-0">
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-80 text-xs">
                            Short notes, events, study topics, rough English — all work. We expand into a polished post.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Textarea
                      id="custom-topic"
                      placeholder="College fest recap, exhibition, DSA notes, life update, product launch…"
                      value={customTopic}
                      onChange={(e) => {
                        setCustomTopic(e.target.value);
                        checkProfanity(e.target.value);
                      }}
                      className="min-h-[4.5rem] text-sm resize-y"
                      rows={2}
                    />
                    {isProfanityBlocked && (
                      <p className="text-[11px] text-destructive mt-1">
                        Content contains inappropriate language
                      </p>
                    )}
                  </div>

                  <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2.5 space-y-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                      Style & length
                    </p>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Tonality</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                        {([
                          { id: 'professional', label: 'Professional' },
                          { id: 'casual', label: 'Casual' },
                          { id: 'trendy', label: 'Trendy' },
                          { id: 'storytelling', label: 'Story' },
                          { id: 'bold', label: 'Bold' },
                          { id: 'educational', label: 'Educational' },
                          { id: 'inspirational', label: 'Inspire' },
                        ] as const).map((t) => (
                          <div
                            key={t.id}
                            className={cn(
                              'px-2 py-1 border rounded-md cursor-pointer transition-all text-center text-[11px] sm:text-xs',
                              tonality === t.id
                                ? 'border-primary bg-primary/5 font-medium'
                                : 'border-border/80 hover:border-primary/40',
                            )}
                            onClick={() => setTonality(t.id)}
                          >
                            {t.label}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Caption length</Label>
                      <div className="grid grid-cols-4 gap-1">
                        {([
                          { id: 'short', label: 'Short' },
                          { id: 'medium', label: 'Med' },
                          { id: 'long', label: 'Long' },
                          { id: 'custom', label: 'Custom' },
                        ] as const).map((w) => (
                          <div
                            key={w.id}
                            className={cn(
                              'px-1.5 py-1 border rounded-md cursor-pointer text-center text-[11px] sm:text-xs',
                              wordLimitKind === w.id
                                ? 'border-primary bg-primary/5 font-medium'
                                : 'border-border/80 hover:border-primary/40',
                            )}
                            onClick={() => setWordLimitKind(w.id)}
                          >
                            {w.label}
                          </div>
                        ))}
                      </div>
                      {wordLimitKind === 'custom' && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <Input
                            type="number"
                            min={10}
                            max={5000}
                            value={customWordCountInput}
                            onChange={(e) => setCustomWordCountInput(e.target.value)}
                            onBlur={() => {
                              const parsed = parseInt(customWordCountInput, 10);
                              const validated = isNaN(parsed) || parsed < 10 ? 100 : Math.min(5000, parsed);
                              setCustomWordCount(validated);
                              setCustomWordCountInput(String(validated));
                            }}
                            className="w-20 h-7 text-xs"
                          />
                          <span className="text-[11px] text-muted-foreground">words</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2.5 space-y-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                      Counts
                    </p>
                    {selectedType === 'image' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Label className="text-xs shrink-0">Images</Label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((n) => (
                            <Button
                              key={n}
                              type="button"
                              variant={imageCount === n ? 'default' : 'outline'}
                              size="sm"
                              className="h-7 w-9 px-0 text-xs"
                              onClick={() => setImageCount(n)}
                            >
                              {n}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedType === 'carousel' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Label htmlFor="slide-count" className="text-xs shrink-0">
                          Slides
                        </Label>
                        <Input
                          id="slide-count"
                          type="number"
                          min={2}
                          max={20}
                          value={slideCount}
                          onChange={(e) =>
                            setSlideCount(Math.max(2, Math.min(20, Number(e.target.value) || 2)))
                          }
                          className="w-16 h-7 text-xs"
                        />
                        <span className="text-[11px] text-muted-foreground">2–20</span>
                      </div>
                    )}
                  </div>

                  {showCarouselStudyControls && (
                    <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2.5 space-y-2">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                        Visual (educational)
                      </p>

                      <div>
                        <Label htmlFor="carousel-document-mode" className="text-xs text-muted-foreground mb-1 block">
                          Document mode
                        </Label>
                        <Select
                          value={carouselDocumentModeUi}
                          onValueChange={(v) =>
                            setCarouselDocumentModeUi(v as typeof carouselDocumentModeUi)
                          }
                        >
                          <SelectTrigger id="carousel-document-mode" className="h-8 text-xs">
                            <SelectValue placeholder="Document mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto (from topic)</SelectItem>
                            <SelectItem value="handwritten_notes">Handwritten notes (notebook)</SelectItem>
                            <SelectItem value="structured_document">Structured document (PDF style)</SelectItem>
                            <SelectItem value="none">Off — use visual style below</SelectItem>
                          </SelectContent>
                        </Select>
                        {isDocumentDeckPresetActive && (
                          <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                            Cover + Table of Contents + body pages render deterministically (no LLM image).
                            Pricing is unchanged: cover and TOC are counted toward your slide budget.
                          </p>
                        )}
                      </div>

                      {!isDocumentDeckPresetActive && (
                        <div>
                          <Label htmlFor="carousel-visual-style" className="text-xs text-muted-foreground mb-1 block">
                            Visual style
                          </Label>
                          <Select
                            value={carouselVisualStyle}
                            onValueChange={(v) =>
                              setCarouselVisualStyle(v as typeof carouselVisualStyle)
                            }
                          >
                            <SelectTrigger id="carousel-visual-style" className="h-8 text-xs">
                              <SelectValue placeholder="Style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Auto (from topic)</SelectItem>
                              <SelectItem value="handwritten_notebook">Handwritten notebook</SelectItem>
                              <SelectItem value="handwritten_notebook_dense">Dense notebook pages</SelectItem>
                              <SelectItem value="whiteboard_notes">Whiteboard notes</SelectItem>
                              <SelectItem value="diagram_clean">Clean diagrams</SelectItem>
                              <SelectItem value="stock_visual">Illustrative / stock-safe</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {!isDocumentDeckPresetActive && (
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Density</Label>
                            <Select
                              value={carouselNoteDensityUi}
                              onValueChange={(v) =>
                                setCarouselNoteDensityUi(v as typeof carouselNoteDensityUi)
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Density" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto">Auto</SelectItem>
                                <SelectItem value="compact">Compact</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="dense">Dense study-page</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Programming preset</Label>
                            <Select
                              value={carouselSubjectModeUi}
                              onValueChange={(v) =>
                                setCarouselSubjectModeUi(v as typeof carouselSubjectModeUi)
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto">Auto-detect</SelectItem>
                                <SelectItem value="programming">DSA / programming</SelectItem>
                                <SelectItem value="general">General topics</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      <label className="flex cursor-pointer items-start gap-2 text-[11px] text-muted-foreground">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-border accent-primary"
                          checked={trainingDatasetOptIn}
                          onChange={(e) => setTrainingDatasetOptIn(e.target.checked)}
                        />
                        <span>
                          Opt in to quality dataset capture (sanitized metadata only)
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="flex items-center justify-between px-1 py-1.5 rounded-md bg-muted/30 text-xs">
                    <span className="text-muted-foreground">Est. credits</span>
                    <span className="font-semibold tabular-nums flex items-center gap-1">
                      {customTopicCreditCost} <Coins className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  {/* Inline Progress Display - Custom mode */}
                  {isGenerating && customProgressSteps.length > 0 && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center gap-2 mb-3">
                        <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                        <span className="text-sm font-medium">Generating custom post</span>
                        <span className="text-xs text-muted-foreground ml-auto">{customProgressElapsed}s</span>
                      </div>
                      {selectedType === "carousel" && carouselStyleStatusLabel && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Visuals: <span className="text-foreground font-medium">{carouselStyleStatusLabel}</span>
                        </p>
                      )}
                      <div className="w-full mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{Math.round(displayProgress)}%</span>
                        </div>
                        <Progress value={displayProgress} className="h-2" />
                      </div>
                      <div className="space-y-1 max-h-[200px] overflow-y-auto">
                        {customProgressSteps.map((step) => (
                          <div key={step.key} className={cn(
                            "flex items-center gap-2 text-xs py-0.5 px-1 rounded transition-colors",
                            step.status === "done" && "bg-green-500/5",
                            step.status === "running" && "bg-primary/5"
                          )}>
                            {step.status === "done" ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 fill-green-500/20 shrink-0" />
                            ) : step.status === "running" ? (
                              <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                            ) : step.status === "failed" ? (
                              <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                            ) : (
                              <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                            )}
                            <span className={cn(
                              step.status === "running" ? "text-primary font-medium" :
                              step.status === "done" ? "text-green-600 dark:text-green-400" :
                              step.status === "failed" ? "text-destructive" :
                              "text-muted-foreground/50"
                            )}>
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>


          {/* Generate Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={generationMode === 'custom' ? handleCustomTopicGenerate : handleGenerate}
                disabled={
                  isGenerating ||
                  (generationMode === 'custom' && (
                    isProfanityBlocked ||
                    customTopic.trim().length < 3 ||
                    (userQuota ? userQuota.remainingCredits < customTopicCreditCost : false)
                  ))
                }
                className="w-full gradient-primary text-base py-4 sm:py-5"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    {generationMode === 'custom'
                      ? `Generate (${customTopicCreditCost} credits)`
                      : (generatedContent.length > 0 && selectedTrending ? 'Generate Content' : 'Find Viral Topic')
                    }
                  </>
                )}
              </Button>
              <p className="text-center text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
                {generationMode === 'custom'
                  ? <>This will use {customTopicCreditCost} <Coins className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline" /> • Generation takes 30-60 seconds</>
                  : <>This will use 1.5 <Coins className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline" /> • Generation takes 30-60 seconds</>
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-3 sm:space-y-4 min-w-0">
          {/* Recent Generations */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-primary" />
                  <span>Recent Generations</span>
                </CardTitle>
                {totalGenerationsCount > 0 && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    {totalGenerationsCount}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-3">
              <div className="flex gap-1 mb-2">
                {(['all', 'viral', 'custom'] as const).map((src) => (
                  <button
                    key={src}
                    onClick={() => { setRecentSourceFilter(src); fetchRecentGenerations(src, true); }}
                    className={cn(
                      'text-[10px] sm:text-xs px-2 py-0.5 rounded-full border transition-colors',
                      recentSourceFilter === src
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/40 text-muted-foreground border-border hover:border-primary/40',
                    )}
                  >
                    {src === 'all' ? 'All' : src.charAt(0).toUpperCase() + src.slice(1)}
                  </button>
                ))}
              </div>
              <div className="space-y-2 sm:space-y-2.5">
                {recentGenerations.length > 0 ? (
                  recentGenerations.map((generation) => (
                    <div 
                      key={generation.id} 
                      className="group p-2 sm:p-3 border rounded-lg hover:border-primary/30 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setShowContentModal(true);
                        setSelectedContent(generation);
                      }}
                    >
                      <div className="flex items-start justify-between mb-1 sm:mb-1.5 gap-2">
                        <h4 className="font-medium text-xs sm:text-sm line-clamp-1 flex-1 group-hover:text-primary transition-colors">
                          {generation.title || 'Untitled Content'}
                        </h4>
                        <div className="flex items-center gap-1 shrink-0">
                          {generation.source === 'custom' && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 border-violet-300 text-violet-700 dark:border-violet-600 dark:text-violet-300">Custom</Badge>
                          )}
                          {(() => {
                            const status = generation.publish_status || generation.status || 'ready';
                            const statusMap: Record<string, { label: string; classes: string }> = {
                              ready: { label: 'Ready', classes: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
                              published: { label: 'Published', classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
                              scheduled: { label: 'Scheduled', classes: 'bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary' },
                              draft: { label: 'Draft', classes: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
                              failed: { label: 'Failed', classes: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
                              cancelled: { label: 'Cancelled', classes: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
                              publishing: { label: 'Publishing', classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
                            };
                            const s = statusMap[status] || statusMap.ready;
                            return (
                              <Badge variant="secondary" className={`text-xs shrink-0 ${s.classes}`}>
                                {s.label}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>
                      
                      {generation.content && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-1.5 line-clamp-1">
                          {generation.content.substring(0, 90)}...
                        </p>
                      )}
                      
                      {generation.hashtags && generation.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 sm:gap-1 mb-1 sm:mb-1.5">
                          {generation.hashtags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-[9px] sm:text-xs px-1 sm:px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {generation.hashtags.length > 3 && (
                            <Badge variant="outline" className="text-[9px] sm:text-xs px-1 sm:px-1.5 py-0">
                              +{generation.hashtags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <span>{generation.content_type || 'Post'}</span>
                          {generation.ai_score && (
                            <>
                              <span>•</span>
                              <span className="text-primary font-medium">{generation.ai_score}/100</span>
                            </>
                          )}
                        </div>
                        <span>{new Date(generation.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <div className="w-10 h-10 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">No recent generations</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Your completed content will appear here
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '/agent'}
                      className="text-xs h-7"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generate Content
                    </Button>
                  </div>
                )}
              </div>
              
              {recentGenerations.length > 0 && (
                <div className="pt-2 border-t mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs py-2 hover:bg-primary/5 hover:text-primary transition-colors"
                    onClick={() => window.location.href = '/generations'}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>View All Generations</span>
                      {totalGenerationsCount > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{totalGenerationsCount - 3}
                        </Badge>
                      )}
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
              <CardTitle className="text-sm sm:text-base">Quick Actions</CardTitle>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Navigate to key features</p>
            </CardHeader>
            <CardContent className="space-y-1.5 sm:space-y-2 p-2 sm:p-3">
              <Button 
                variant="outline" 
                className="w-full justify-between h-8 sm:h-9 text-xs sm:text-sm hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                onClick={() => window.location.href = '/dashboard'}
              >
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="truncate">View Calendar</span>
                </div>
                <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
                  {recentGenerations.filter(g => (g.publish_status || g.status) === 'scheduled').length || 0}
                </Badge>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-between h-8 sm:h-9 text-xs sm:text-sm hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                onClick={() => setShowHashtagsModal(true)}
              >
                <div className="flex items-center">
                  <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="truncate">Popular Hashtags</span>
                </div>
                <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
                  {trendingTotal == null ? "…" : trendingTotal}
                </Badge>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-between h-8 sm:h-9 text-xs sm:text-sm hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                onClick={() => window.location.href = '/analytics'}
              >
                <div className="flex items-center">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="truncate">Analytics</span>
                </div>
                <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
                  {recentGenerations.length > 0 ? Math.round(recentGenerations.reduce((acc, g) => acc + (g.ai_score || 0), 0) / recentGenerations.length) : 0}/100
                </Badge>
              </Button>
              
              {/* Quick Stats */}
              <div className="pt-1.5 sm:pt-2 mt-1.5 sm:mt-2 border-t border-border/50">
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                  <div className="text-center p-1.5 sm:p-2 bg-muted/30 rounded-md">
                    <div className="font-semibold text-primary">{totalGenerationsCount || 0}</div>
                    <div className="text-muted-foreground">Total Posts</div>
                  </div>
                  <div className="text-center p-1.5 sm:p-2 bg-muted/30 rounded-md">
                    <div className="font-semibold text-green-600">
                      {recentGenerations.filter(g => (g.publish_status || g.status) === 'published').length}
                    </div>
                    <div className="text-muted-foreground">Published</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Popular Hashtags Modal */}
      <Dialog open={showHashtagsModal} onOpenChange={setShowHashtagsModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              Popular Hashtags
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Live signals from Instagram, X, and LinkedIn (badges show where each tag appeared)
            </p>
            {!loadingHashtags && trendingTotal != null && trendingTotal > 0 && (
              <p className="text-xs text-muted-foreground">
                Showing {popularHashtags.length} of {trendingTotal} ranked hashtags
                {trendingHasMore ? " · more available below" : ""}
              </p>
            )}
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {loadingHashtags ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading popular hashtags...</p>
              </div>
            ) : popularHashtags.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {popularHashtags.map((hashtag, index) => (
                    <div 
                      key={`${hashtag.tag}-${index}`}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(hashtag.tag);
                        toast.success(`Copied ${hashtag.tag} to clipboard!`);
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="flex items-center gap-1 shrink-0">
                          <span className="font-mono text-sm text-primary">{hashtag.rank || index + 1}</span>
                          {hashtag.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                          {hashtag.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                          {hashtag.trend === 'stable' && <div className="w-3 h-0.5 bg-gray-400 rounded"></div>}
                          </div>
                          <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-medium text-sm truncate">{hashtag.tag}</p>
                            {(() => {
                              const sb = hashtag.source_breakdown || {};
                              const ig = Number(sb.instagram || 0);
                              const tw = Number(sb.twitter || 0);
                              const li = Number(sb.linkedin || 0);
                              const igReel = Number(sb.ig_reel || 0);
                              const igPost = Number(sb.ig_post || 0);
                              const tweetFmt = Number(sb.tweet || 0);
                              const liPostFmt = Number(sb.li_post || 0);
                              const chipCls =
                                "inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-md leading-none";
                              const dotCls = "h-1.5 w-1.5 rounded-full shrink-0";
                              if (!ig && !tw && !li) {
                                return (
                                  <span
                                    title="No external scrape data for this row (in-house or stale). Purge in-house in Settings → Scraper Debug, then Refresh All Tags."
                                    className={`${chipCls} bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25`}
                                  >
                                    <span className={`${dotCls} bg-amber-500`} /> —
                                  </span>
                                );
                              }
                              const igHint =
                                igReel || igPost
                                  ? `Instagram: ${ig} caption hits — reels ${igReel}, photo posts ${igPost}`
                                  : `Instagram: ${ig} caption hits`;
                              const xHint =
                                tweetFmt > 0
                                  ? `X: ${tw} tweets (${tweetFmt} with typed format)`
                                  : `X: ${tw} tweets`;
                              const liHint =
                                liPostFmt > 0
                                  ? `LinkedIn: ${li} posts (${liPostFmt} with typed format)`
                                  : `LinkedIn: ${li} posts`;
                              return (
                                <div className="flex items-center gap-1 shrink-0 flex-wrap">
                                  {ig > 0 && (
                                    <span
                                      title={igHint}
                                      className={`${chipCls} bg-pink-500/10 text-pink-500 border border-pink-500/25`}
                                    >
                                      <span className={`${dotCls} bg-pink-500`} />
                                      IG·{ig}
                                      {(igReel > 0 || igPost > 0) && (
                                        <span className="opacity-60 font-normal text-[8px]">
                                          {igReel > 0 ? " reel" : ""}
                                          {igPost > 0 ? " post" : ""}
                                        </span>
                                      )}
                                    </span>
                                  )}
                                  {tw > 0 && (
                                    <span
                                      title={xHint}
                                      className={`${chipCls} bg-slate-500/10 text-slate-300 border border-slate-500/25`}
                                    >
                                      <span className={`${dotCls} bg-slate-400`} />
                                      X·{tw}
                                      <span className="opacity-60 font-normal text-[8px]"> tweet</span>
                                    </span>
                                  )}
                                  {li > 0 && (
                                    <span
                                      title={liHint}
                                      className={`${chipCls} bg-sky-500/10 text-sky-400 border border-sky-500/25`}
                                    >
                                      <span className={`${dotCls} bg-sky-500`} />
                                      LI·{li}
                                      <span className="opacity-60 font-normal text-[8px]"> post</span>
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                          <p className="text-xs text-muted-foreground break-words">
                            {(() => {
                              const sb = hashtag.source_breakdown || {};
                              const ext =
                                Number(sb.instagram || 0) +
                                Number(sb.twitter || 0) +
                                Number(sb.linkedin || 0);
                              if (ext > 0) {
                                return (
                                  <>
                                    Mentions in scraped posts: {hashtag.count} · Score:{" "}
                                    {hashtag.score.toFixed(2)}
                                  </>
                                );
                              }
                              return (
                                <>
                                  In-app usage: {hashtag.count} · Score: {hashtag.score.toFixed(2)}
                                </>
                              );
                            })()}
                          </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          Copy
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {trendingHasMore && (
                  <div className="flex justify-center pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={loadingMoreHashtags || loadingHashtags}
                      onClick={() =>
                        void fetchTrendingPage(
                          popularHashtags.length,
                          true,
                          trendingModalSessionRef.current?.signal,
                        )
                      }
                    >
                      {loadingMoreHashtags ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                          Loading…
                        </>
                      ) : (
                        "Load more"
                      )}
                    </Button>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-muted-foreground">
                      💡 Tip: Click any hashtag to copy it to your clipboard
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowHashtagsModal(false);
                        window.location.href = '/analytics';
                      }}
                      className="flex-1"
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      View Analytics
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowHashtagsModal(false)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            ) : trendingTotal != null && trendingTotal > 0 ? (
              <div className="text-center py-10 space-y-4 px-2">
                <Hash className="h-10 w-10 text-muted-foreground mx-auto opacity-60" />
                <h3 className="font-medium">Could not load this page</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  The index has{" "}
                  <span className="font-semibold text-foreground">{trendingTotal}</span> ranked
                  hashtags, but nothing rendered here. Retry to load again.
                  If this continues, please contact support.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    type="button"
                    onClick={() =>
                      void fetchTrendingPage(
                        0,
                        false,
                        trendingModalSessionRef.current?.signal,
                      )
                    }
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No hashtags yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No trending hashtags are available yet. Try again shortly after new external posts are
                  fetched.
                </p>
                <Button 
                  onClick={() => {
                    setShowHashtagsModal(false);
                  }}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPostingAccountModal} onOpenChange={setShowPostingAccountModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose LinkedIn account</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Select where you want to publish this post.
            </p>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {loadingPostingIdentities && (
                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                  Loading accounts...
                </div>
              )}
              {!loadingPostingIdentities && postingIdentities.length === 0 && (
                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                  No LinkedIn identities found. We will publish using your personal profile.
                </div>
              )}
              {postingIdentities.map((identity) => {
                const selected = identity.id === selectedPostingIdentityId;
                const title = getIdentityDisplayName(identity);
                const subtitle =
                  identity.actorType === "organization"
                    ? "Company Page"
                    : "Personal profile";
                const fallback =
                  title.charAt(0).toUpperCase() ||
                  (identity.actorType === "organization" ? "C" : "P");
                return (
                  <button
                    key={identity.id}
                    type="button"
                    onClick={() => setSelectedPostingIdentityId(identity.id)}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={
                            identity.avatarUrl ||
                            (identity.actorType === "member"
                              ? (user?.user_metadata?.avatar_url as string) || ""
                              : "")
                          }
                        />
                        <AvatarFallback className="text-xs">
                          {identity.actorType === "organization" ? (
                            <Building2 className="h-4 w-4" />
                          ) : (
                            fallback
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{title}</p>
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                      </div>
                      {selected && (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPostingAccountModal(false);
                  setPendingPostAction(null);
                  setPendingActionContent(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => void confirmPostingAction()}>
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={
          generationMode === "custom" &&
          isGenerating &&
          customProgressSteps.length > 0
        }
        onOpenChange={() => undefined}
      >
        <DialogContent
          className="sm:max-w-md gap-3 p-4 z-[60] [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary animate-spin" />
              Generating custom post
            </DialogTitle>
            <p className="text-[11px] text-muted-foreground text-left font-normal">
              {customProgressElapsed}s elapsed
            </p>
          </DialogHeader>
          {selectedType === "carousel" && carouselStyleStatusLabel && (
            <p className="text-[11px] text-muted-foreground">
              Visuals:{" "}
              <span className="text-foreground font-medium">{carouselStyleStatusLabel}</span>
            </p>
          )}
          {/* Show parallel generation indicator */}
          {(() => {
            const runningCount = customProgressSteps.filter(s => s.status === "running").length;
            const doneCount = customProgressSteps.filter(s => s.status === "done").length;
            const totalSlides = customProgressSteps.filter(s => s.key.startsWith("slide_")).length;
            return runningCount > 1 ? (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-primary/10 border border-primary/20 mb-2">
                <div className="flex -space-x-1">
                  {Array.from({ length: Math.min(runningCount, 3) }).map((_, i) => (
                    <RefreshCw key={i} className="h-3 w-3 text-primary animate-spin" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-[11px] text-primary font-medium">
                  {runningCount} slides generating in parallel
                </span>
              </div>
            ) : totalSlides > 0 && doneCount > 0 ? (
              <p className="text-[11px] text-muted-foreground mb-1">
                {doneCount}/{totalSlides + 4} steps completed
              </p>
            ) : null;
          })()}
          <div className="space-y-1 max-h-[40vh] overflow-y-auto pr-1">
            {customProgressSteps.map((step) => (
              <div key={step.key} className={cn(
                "flex items-center gap-2 text-xs py-0.5 px-1 rounded transition-colors",
                step.status === "done" && "bg-green-500/5",
                step.status === "running" && "bg-primary/5"
              )}>
                {step.status === "done" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 fill-green-500/20 shrink-0" />
                ) : step.status === "running" ? (
                  <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                ) : step.status === "failed" ? (
                  <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                )}
                <span
                  className={cn(
                    step.status === "running"
                      ? "text-primary font-medium"
                      : step.status === "done"
                        ? "text-green-600 dark:text-green-400"
                        : step.status === "failed"
                          ? "text-destructive"
                          : "text-muted-foreground/50",
                  )}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <Progress value={displayProgress} className="h-1" />
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-8"
            onClick={async () => {
              if (currentJobId) {
                try {
                  await apiClient.delete(`/generation/job/${currentJobId}/cancel`);
                  setIsGenerating(false);
                  setIsFailed(true);
                  setIsComplete(true);
                  setCustomProgressStartedAt(null);
                  setCustomProgressSteps([]);
                  toast.info("Generation cancelled. Credits will be refunded.");
                  await refreshQuota(true);
                } catch {
                  toast.error("Could not cancel the job.");
                }
              }
            }}
          >
            Cancel
          </Button>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <ScheduleModal
        open={showContentModal}
        onOpenChange={setShowContentModal}
        content={selectedContent}
        onSuccess={fetchRecentGenerations}
        calculateCreditCost={calculateCreditCost}
        postingTarget={
          selectedPostingIdentity
            ? {
                actorType: selectedPostingIdentity.actorType,
                organizationUrn: selectedPostingIdentity.organizationUrn,
                label: getIdentityDisplayName(selectedPostingIdentity),
                avatarUrl: selectedPostingIdentity.avatarUrl,
              }
            : null
        }
        postingIdentities={postingIdentities.map((identity) => ({
          id: identity.id,
          actorType: identity.actorType,
          label: getIdentityDisplayName(identity),
          organizationUrn: identity.organizationUrn,
          avatarUrl: identity.avatarUrl,
        }))}
        selectedPostingIdentityId={selectedPostingIdentityId}
        onSelectPostingIdentity={setSelectedPostingIdentityId}
      />
    </div>
  );
}