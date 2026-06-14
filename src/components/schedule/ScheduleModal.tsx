import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { apiClient, api } from '@/lib/apiClient';
import { dispatchFeedbackEligibilityRefresh } from '@/lib/feedbackEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useQuota } from '@/contexts/QuotaContext';
import { useProfile } from '@/hooks/useProfile';
import { useSocialChannelCheck } from '@/hooks/useSocialChannelCheck';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  formatLinkedInLengthError,
  isLinkedInCommentaryWithinLimit,
  linkedInCommentaryLength,
  LINKEDIN_MAX_TEXT_LENGTH,
} from '@/lib/linkedin-publish-text';
import Image from 'next/image';
import {
  formatInTimezone,
  getPreferredTimezoneSync,
  resolveTimezone,
} from '@/services/timezoneService';
import {
  Calendar,
  Send,
  X,
  Upload,
  Trash2,
  FileText,
  Globe,
  ThumbsUp,
  Heart,
  MessageCircle,
  Repeat2,
  Sparkles,
  Coins,
  Bold,
  Italic,
  Underline,
  ImageIcon,
  Smile,
  Hash,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';

// Regeneration pricing — sourced from the single source of truth
// (`creditCosts.ts`, which mirrors backend `credit-costs.ts` and is refreshed
// live from `GET /credits/costs`). No hardcoded numbers here.
import { DEFAULT_CREDIT_COSTS } from '@/lib/creditCosts';
import { stripModelAttribution } from '@/lib/stripModelAttribution';
const REGEN_IMAGE_CREDIT_COST = DEFAULT_CREDIT_COSTS.regenerate.singleImage;
const REGEN_SLIDE_CREDIT_COST = DEFAULT_CREDIT_COSTS.regenerate.slidePerUnit;

function ImageRegenOverlay({
  progress,
  compact = false,
}: {
  progress: number | null;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none">
        <Loader2 className="h-5 w-5 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/65 text-white gap-2 backdrop-blur-sm pointer-events-none">
      <Loader2 className="h-7 w-7 animate-spin" />
      <span className="font-medium text-sm">Regenerating image…</span>
      {typeof progress === 'number' && progress > 0 && (
        <div className="w-36 space-y-1">
          <Progress value={progress} className="h-1.5 bg-white/20" />
          <p className="text-[10px] text-center text-white/80">{Math.round(progress)}%</p>
        </div>
      )}
    </div>
  );
}

/** Resolve original custom-topic for full post regen (meta → caption lead → title). */
function resolvePostRegenTopic(
  content: { content?: string; title?: string },
  customTopicMeta?: { topic?: unknown },
): string {
  const fromMeta =
    typeof customTopicMeta?.topic === 'string' ? customTopicMeta.topic.trim() : '';
  if (fromMeta.length >= 3) return fromMeta;

  const withoutFooter = stripModelAttribution(String(content?.content || ''));
  const firstSentence =
    withoutFooter.split(/(?<=[.!?])\s+/)[0]?.trim() ||
    withoutFooter.slice(0, 300).trim();
  if (firstSentence.length >= 3) return firstSentence;

  const title = String(content?.title || '').trim();
  return title.length >= 3 ? title : '';
}

function isCustomGeneratedPost(
  content: { source?: string },
  customTopicMeta?: Record<string, unknown> | null,
): boolean {
  if (content.source === 'custom') return true;
  if (!customTopicMeta || typeof customTopicMeta !== 'object') return false;
  return Boolean(
    customTopicMeta.contentType ||
      (Array.isArray(customTopicMeta.imagePrompts) && customTopicMeta.imagePrompts.length > 0) ||
      (Array.isArray(customTopicMeta.slides) && customTopicMeta.slides.length > 0) ||
      typeof customTopicMeta.topic === 'string',
  );
}

const extractLinkedinText = (value: unknown): string => {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  if (value && typeof value === 'object') {
    const localized = (value as { localized?: Record<string, unknown> }).localized;
    if (localized) {
      const first = Object.values(localized).find(
        (v) => typeof v === 'string' && v.trim().length > 0,
      ) as string | undefined;
      if (first) return first.trim();
    }
  }
  return 'LinkedIn identity';
};

const LINK_REGEX = /(https?:\/\/[^\s)]+)/g;
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

const isHashtagOnlyLine = (trimmed: string): boolean =>
  trimmed.length > 0 &&
  trimmed.split(/\s+/).every((token) => /^#[\w]+$/i.test(token));

function normalizeHashtagTag(raw: string): string {
  const inner = raw.trim().replace(/^#+/, '').replace(/\s+/g, '');
  if (!inner) return '';
  return `#${inner}`;
}

function parseHashtagInput(input: string): string[] {
  return input
    .split(/[,\s]+/)
    .map(normalizeHashtagTag)
    .filter(Boolean);
}

/** Collapse huge vertical gaps, fix URLs split across lines, drop trailing # blocks (shown again as chips). */
const prepareLinkedinPreviewBody = (raw: string): string => {
  let t = stripModelAttribution(String(raw || '')).replace(/\r\n/g, '\n');
  t = t.replace(/\n{3,}/g, '\n\n');
  t = t.replace(/https?:\/\/[^\s]+/gi, (url) => url.replace(/\s+/g, ''));
  const lines = t.split('\n');
  let end = lines.length;
  while (end > 0) {
    const row = lines[end - 1].trim();
    if (!row) {
      end -= 1;
      continue;
    }
    if (isHashtagOnlyLine(row)) {
      end -= 1;
      continue;
    }
    break;
  }
  return lines.slice(0, end).join('\n').trimEnd();
};

const renderInlineRichText = (line: string): React.ReactNode[] => {
  const withMarkdownLinks = line.replace(
    MARKDOWN_LINK_REGEX,
    (_, label: string, url: string) => `${label} (${url})`,
  );
  const parts = withMarkdownLinks.split(LINK_REGEX);
  const nodes: React.ReactNode[] = [];

  const pushFormattedText = (text: string, keyPrefix: string) => {
    const segments = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|==[^=]+==)/g);
    segments.forEach((segment, idx) => {
      if (!segment) return;
      const key = `${keyPrefix}-${idx}`;
      if (segment.startsWith('**') && segment.endsWith('**')) {
        nodes.push(<strong key={key}>{segment.slice(2, -2)}</strong>);
        return;
      }
      if (segment.startsWith('__') && segment.endsWith('__')) {
        nodes.push(<u key={key}>{segment.slice(2, -2)}</u>);
        return;
      }
      if (segment.startsWith('*') && segment.endsWith('*')) {
        nodes.push(<em key={key}>{segment.slice(1, -1)}</em>);
        return;
      }
      if (segment.startsWith('==') && segment.endsWith('==')) {
        nodes.push(
          <mark key={key} className="rounded bg-yellow-100 px-1 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-100">
            {segment.slice(2, -2)}
          </mark>,
        );
        return;
      }
      nodes.push(<span key={key}>{segment}</span>);
    });
  };

  parts.forEach((part, idx) => {
    if (!part) return;
    if (/^https?:\/\//.test(part)) {
      const url = part.replace(/[).,\]]+$/g, '');
      nodes.push(
        <a
          key={`link-${idx}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block max-w-full text-primary underline-offset-2 hover:underline break-all [overflow-wrap:anywhere]"
        >
          {url}
        </a>,
      );
      return;
    }
    pushFormattedText(part, `text-${idx}`);
  });

  return nodes;
};

const renderRichLines = (text: string): React.ReactNode[] =>
  text.split('\n').map((line, index) => {
    const trimmed = line.trim();
    const isBullet = /^[-*•]\s+/.test(trimmed);
    const isNumbered = /^\d+[.)]\s+/.test(trimmed);
    const content = isBullet
      ? trimmed.replace(/^[-*•]\s+/, '')
      : isNumbered
        ? trimmed.replace(/^\d+[.)]\s+/, '')
        : line;
    const isBlank = trimmed.length === 0;

    return (
      <p
        key={`line-${index}`}
        className={cn(
          'text-[13px] sm:text-[14px] text-foreground',
          isBlank ? 'mb-0 min-h-[0.5rem]' : 'mb-1.5',
          (isBullet || isNumbered) && 'pl-1',
        )}
        style={{
          lineHeight: 1.5,
          maxWidth: '100%',
        }}
      >
        {isBullet ? '• ' : ''}
        {isNumbered ? `${trimmed.match(/^\d+/)?.[0]}. ` : ''}
        {!isBlank ? renderInlineRichText(content) : '\u00A0'}
      </p>
    );
  });

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: any;
  onSuccess?: () => void;
  calculateCreditCost?: (content: any, isScheduled: boolean) => number;
  postingTarget?: {
    actorType?: 'member' | 'organization';
    organizationUrn?: string;
    label?: string;
    avatarUrl?: string;
  } | null;
  postingIdentities?: Array<{
    id: string;
    actorType: 'member' | 'organization';
    label: string;
    organizationUrn?: string;
    avatarUrl?: string;
  }>;
  selectedPostingIdentityId?: string;
  onSelectPostingIdentity?: (identityId: string) => void;
  readOnly?: boolean;
  /** Current Agent brand-kit toggle — used when regenerating the full post. */
  includeBrandKit?: boolean;
  onContentRegenerated?: (patch: Record<string, unknown>) => void;
}

export function ScheduleModal({ 
  open, 
  onOpenChange, 
  content, 
  onSuccess,
  calculateCreditCost = () => DEFAULT_CREDIT_COSTS.postNow.text,
  postingTarget = null,
  postingIdentities = [],
  selectedPostingIdentityId = '',
  onSelectPostingIdentity,
  readOnly = false,
  includeBrandKit = true,
  onContentRegenerated,
}: ScheduleModalProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { refreshQuota, quota } = useQuota();
  const { showConnectionRequired } = useSocialChannelCheck();
  const remainingCredits =
    typeof quota?.remainingCredits === 'number' ? quota.remainingCredits : null;
  
  const [isSchedulingExpanded, setIsSchedulingExpanded] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedHashtags, setEditedHashtags] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedPickerImage, setSelectedPickerImage] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [hasConfirmedIdentityOnce, setHasConfirmedIdentityOnce] = useState(false);
  const [pendingIdentityAction, setPendingIdentityAction] = useState<"publish" | "schedule" | null>(null);
  const [localPostingIdentities, setLocalPostingIdentities] = useState<
    Array<{
      id: string;
      actorType: 'member' | 'organization';
      label: string;
      organizationUrn?: string;
      avatarUrl?: string;
    }>
  >([]);
  const [localSelectedIdentityId, setLocalSelectedIdentityId] = useState('');
  const [newHashtagInput, setNewHashtagInput] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [userTimezone, setUserTimezone] = useState<string>(getPreferredTimezoneSync());
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  // Track in-flight regen so the user can't double-fire while the worker is
  // running. The button is also disabled, but we keep an in-state guard for
  // belt-and-suspenders idempotency (matches the backend `refundOnce` slice).
  const [regeneratingImageIndex, setRegeneratingImageIndex] = useState<number | null>(null);
  const [activeImageRegenJobId, setActiveImageRegenJobId] = useState<string | null>(null);
  const [imageRegenProgress, setImageRegenProgress] = useState<number | null>(null);
  const initializedContentIdRef = useRef<string | null>(null);
  const [regeneratingCarousel, setRegeneratingCarousel] = useState(false);
  const [regeneratingPost, setRegeneratingPost] = useState(false);
  const [regenConfirmDialog, setRegenConfirmDialog] = useState<{
    title: string;
    description: React.ReactNode;
    confirmLabel: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [regenConfirmLoading, setRegenConfirmLoading] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  // Local mirror of the backend `image_urls` / `visual_url` / `carousel_urls`
  // / `pdf_url` fields. Initialized from the `content` prop, updated in place
  // when the SSE `image_regenerated` / `carousel_regenerated` events fire.
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  const [currentImagePrompts, setCurrentImagePrompts] = useState<string[]>([]);
  const [currentVisualUrl, setCurrentVisualUrl] = useState<string | null>(null);
  const [currentCarouselUrls, setCurrentCarouselUrls] = useState<string[]>([]);
  const [currentCarouselPdfUrl, setCurrentCarouselPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    void resolveTimezone().then(setUserTimezone).catch(() => undefined);
  }, []);

  const closeRegenConfirm = () => {
    if (!regenConfirmLoading) setRegenConfirmDialog(null);
  };

  const runRegenConfirm = async () => {
    if (!regenConfirmDialog) return;
    setRegenConfirmLoading(true);
    try {
      await regenConfirmDialog.onConfirm();
      setRegenConfirmDialog(null);
    } finally {
      setRegenConfirmLoading(false);
    }
  };

  const executeRegenerate = async (type: 'carousel' | 'images') => {
    if (!content?.id) return;

    try {
      setIsRegenerating(true);
      const response = await apiClient.post(`/generation/content/${content.id}/regenerate`, {
        regenerationType: type,
      });

      toast.success(response.message || `${type === 'carousel' ? 'Carousel' : 'Image'} regeneration started!`);
      refreshQuota();

      toast.info('Regeneration in progress. The preview will update when complete.', { duration: 5000 });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to start regeneration';
      toast.error(errorMessage);
    } finally {
      setIsRegenerating(false);
    }
  };

  const promptRegenerate = (type: 'carousel' | 'images') => {
    if (!content?.id) return;

    const slideCount = content.carousel_urls?.length || 0;
    const imageCount = content.image_urls?.length || 1;
    const creditsCost =
      type === 'carousel'
        ? slideCount * REGEN_SLIDE_CREDIT_COST
        : imageCount * REGEN_IMAGE_CREDIT_COST;
    const mediaLabel = type === 'carousel' ? 'carousel slides' : 'images';

    setRegenConfirmDialog({
      title: `Regenerate ${mediaLabel}?`,
      description: (
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>This replaces the current {mediaLabel} with newly generated versions.</p>
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            Cost: {creditsCost}
            <Coins className="h-3.5 w-3.5" />
          </p>
        </div>
      ),
      confirmLabel: `Regenerate ${type === 'carousel' ? 'carousel' : 'images'}`,
      onConfirm: () => executeRegenerate(type),
    });
  };

  /**
   * Granular per-image regeneration. Re-uses the AI prompt persisted on the
   * content row (`performance_prediction.customTopicMeta.imagePrompts[i]`)
   * unless the caller passed a `userOverridePrompt`. Disabled when the user
   * has uploaded a PDF (PDF replaces media), uploaded their own images
   * (those aren't AI-prompt-backed), or has insufficient credits.
   */
  const executeRegenerateSingleImage = async (imageIndex: number) => {
    if (!content?.id) return;

    try {
      setRegeneratingImageIndex(imageIndex);
      setImageRegenProgress(8);
      setActiveImageRegenJobId(null);
      const res = await api.generation.regenerateImage(content.id, imageIndex, {
        caption: editedContent || content.content || '',
        includeBrandKit,
      });
      if (res?.jobId) {
        setActiveImageRegenJobId(res.jobId);
      }
      refreshQuota();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to start image regeneration';
      toast.error(errorMessage);
      setRegeneratingImageIndex(null);
      setActiveImageRegenJobId(null);
      setImageRegenProgress(null);
    }
  };

  const promptRegenerateSingleImage = (imageIndex: number) => {
    if (!content?.id) return;
    if (regeneratingImageIndex !== null || regeneratingCarousel || regeneratingPost) return;
    if (uploadedPdfUrl) {
      toast.info('Remove the uploaded PDF to regenerate images.');
      return;
    }
    if (typeof remainingCredits === 'number' && remainingCredits < REGEN_IMAGE_CREDIT_COST) {
      toast.error(
        `Need ${REGEN_IMAGE_CREDIT_COST} credits to regenerate this image (you have ${remainingCredits}).`,
      );
      return;
    }

    setRegenConfirmDialog({
      title: 'Regenerate this image?',
      description: (
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Adds a new image option in the picker using your topic, caption,
            brand vocabulary, and past-post style — not a copy of the old image.
          </p>
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            Cost: {REGEN_IMAGE_CREDIT_COST}
            <Coins className="h-3.5 w-3.5" />
          </p>
        </div>
      ),
      confirmLabel: 'Regenerate image',
      onConfirm: () => executeRegenerateSingleImage(imageIndex),
    });
  };

  /**
   * Full-carousel regeneration. Hits the new `/generation/regenerate/carousel`
   * endpoint which costs 2.5 × slideCount credits. Disabled while a PDF is
   * uploaded (PDF replaces the carousel) or any other regen is in flight.
   */
  const executeRegenerateCarousel = async (slideCount: number, cost: number) => {
    if (!content?.id) return;

    try {
      setRegeneratingCarousel(true);
      const res = await api.generation.regenerateCarousel(content.id, { slideCount });
      toast.success(
        res?.message || `Carousel regeneration started — ${cost} credits reserved.`,
      );
      refreshQuota();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to start carousel regeneration';
      toast.error(errorMessage);
      setRegeneratingCarousel(false);
    }
  };

  const promptRegenerateCarousel = () => {
    if (!content?.id) return;
    if (regeneratingCarousel || regeneratingImageIndex !== null || regeneratingPost) return;
    if (uploadedPdfUrl) {
      toast.info('Remove the uploaded PDF to regenerate the carousel.');
      return;
    }
    const slideCount = currentCarouselUrls.length || content.carousel_urls?.length || 0;
    if (slideCount === 0) {
      toast.error('No carousel found on this content to regenerate.');
      return;
    }
    const cost = REGEN_SLIDE_CREDIT_COST * slideCount;
    if (typeof remainingCredits === 'number' && remainingCredits < cost) {
      toast.error(
        `Need ${cost} credits to regenerate this carousel (you have ${remainingCredits}).`,
      );
      return;
    }

    setRegenConfirmDialog({
      title: 'Regenerate carousel?',
      description: (
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>The AI deck will be re-rendered without re-running the LLM.</p>
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            Cost: {REGEN_SLIDE_CREDIT_COST} × {slideCount} = {cost}
            <Coins className="h-3.5 w-3.5" />
          </p>
        </div>
      ),
      confirmLabel: 'Regenerate carousel',
      onConfirm: () => executeRegenerateCarousel(slideCount, cost),
    });
  };

  /**
   * Format/improve the user's content using AI.
   * Costs 0.5 credits per format.
   */
  const handleAIFormat = async () => {
    if (isFormatting || editedContent.length < 20) return;

    try {
      setIsFormatting(true);
      const response = await api.generation.formatContent(editedContent);
      
      if (response.formattedContent) {
        setEditedContent(response.formattedContent);
        toast.success('Content formatted successfully!');
        refreshQuota();
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to format content';
      
      if (errorMessage.includes('Insufficient credits')) {
        toast.error(`Insufficient credits. AI formatting costs ${DEFAULT_CREDIT_COSTS.aiTextFormatting} credits.`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsFormatting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      initializedContentIdRef.current = null;
      return;
    }
    if (!content?.id) return;

    const isNewContent = initializedContentIdRef.current !== content.id;
    if (!isNewContent) return;

    initializedContentIdRef.current = content.id;
    setEditedContent(stripModelAttribution(content.content || ''));
    setEditedHashtags(
      Array.isArray(content.hashtags)
        ? content.hashtags.map((t: string) => normalizeHashtagTag(String(t))).filter(Boolean)
        : [],
    );
    setNewHashtagInput('');
    setUploadedImages([]);
    setUploadedPdfUrl(null);
    setUploadedPdfName(null);
    setCarouselIndex(0);
    setSelectedPickerImage(null);
    const initialUrls = Array.isArray(content.image_urls)
      ? [...content.image_urls]
      : typeof content.visual_url === 'string' && content.visual_url.startsWith('http')
        ? [content.visual_url]
        : [];
    setCurrentImageUrls(initialUrls);
    const initialPrompts = content.performance_prediction?.customTopicMeta?.imagePrompts;
    setCurrentImagePrompts(
      Array.isArray(initialPrompts) ? [...initialPrompts] : [],
    );
    setCurrentVisualUrl(
      typeof content.visual_url === 'string' ? content.visual_url : null,
    );
    setCurrentCarouselUrls(
      Array.isArray(content.carousel_urls) ? [...content.carousel_urls] : [],
    );
    setCurrentCarouselPdfUrl(
      typeof content.pdf_url === 'string' ? content.pdf_url : null,
    );
    setRegeneratingImageIndex(null);
    setActiveImageRegenJobId(null);
    setImageRegenProgress(null);
    setRegeneratingCarousel(false);
    setRegeneratingPost(false);

    const now = new Date();
    now.setSeconds(0, 0);
    setScheduleDateTime(now.toISOString());

    if (content.isOwnContent) {
      setIsSchedulingExpanded(true);
    }
  }, [content?.id, open, content]);

  useEffect(() => {
    if (!open || !activeImageRegenJobId) return;

    const onImageRegenProgress = (event: Event) => {
      const detail = (event as CustomEvent).detail || {};
      if (detail.generationId !== activeImageRegenJobId) return;
      const subtaskKey = detail.subtaskKey;
      if (typeof subtaskKey !== 'string' || !subtaskKey.startsWith('image_regen_')) return;
      if (typeof detail.percent === 'number') {
        setImageRegenProgress(detail.percent);
      }
    };

    window.addEventListener('trndinn:generation-progress', onImageRegenProgress as EventListener);
    return () => {
      window.removeEventListener(
        'trndinn:generation-progress',
        onImageRegenProgress as EventListener,
      );
    };
  }, [open, activeImageRegenJobId]);

  // Listen for the SSE-fanout custom events emitted by NotificationContext.
  // We can't subscribe to the SSE stream directly here (single shared
  // connection lives in NotificationContext), so the context dispatches
  // browser CustomEvents that the modal swaps into local state.
  useEffect(() => {
    if (!open || !content?.id) return;

    const onImageRegenerated = (event: Event) => {
      const detail = (event as CustomEvent).detail || {};
      if (!detail || detail.contentId !== content.id) return;
      const idx = Number(detail.imageIndex);
      const newUrl = String(detail.newImageUrl || '');
      if (!newUrl || !Number.isInteger(idx) || idx < 0) return;

      const sourceIdx = Number.isInteger(detail.sourceImageIndex)
        ? Number(detail.sourceImageIndex)
        : idx;
      const appended = detail.appended === true;

      if (appended) {
        setCurrentImageUrls((prev) => {
          if (prev.includes(newUrl)) return prev;
          setCurrentImagePrompts((prompts) => {
            const sourcePrompt =
              prompts[sourceIdx] || prompts[prompts.length - 1] || '';
            return [...prompts, sourcePrompt];
          });
          setSelectedPickerImage(newUrl);
          return [...prev, newUrl];
        });
      } else {
        setCurrentImageUrls((prev) => {
          const next = [...prev];
          while (next.length <= idx) next.push('');
          const previousUrl = next[idx];
          next[idx] = newUrl;
          setCurrentVisualUrl((vu) =>
            vu === previousUrl || (idx === 0 && !vu) ? newUrl : vu,
          );
          setSelectedPickerImage((sel) => (sel === previousUrl ? newUrl : sel));
          return next;
        });
      }

      setRegeneratingImageIndex(null);
      setActiveImageRegenJobId(null);
      setImageRegenProgress(null);
      toast.success(
        appended
          ? 'New image added — pick the best option below.'
          : 'Image regenerated successfully.',
      );
    };

    const onPostRegenerated = (event: Event) => {
      const detail = (event as CustomEvent).detail || {};
      if (!detail || detail.contentId !== content.id) return;

      if (typeof detail.caption === 'string') {
        setEditedContent(stripModelAttribution(detail.caption));
      }
      if (Array.isArray(detail.hashtags)) {
        setEditedHashtags(
          detail.hashtags.map((t: string) => normalizeHashtagTag(String(t))).filter(Boolean),
        );
      }
      if (Array.isArray(detail.imageUrls)) {
        setCurrentImageUrls([...detail.imageUrls]);
        setCurrentVisualUrl(
          typeof detail.visualUrl === 'string'
            ? detail.visualUrl
            : detail.imageUrls[0] ?? null,
        );
        setSelectedPickerImage(null);
      }
      if (Array.isArray(detail.carouselUrls)) {
        setCurrentCarouselUrls([...detail.carouselUrls]);
        setCarouselIndex(0);
      }
      if (typeof detail.pdfUrl === 'string') {
        setCurrentCarouselPdfUrl(detail.pdfUrl);
      }

      setRegeneratingPost(false);
      onContentRegenerated?.({
        id: content.id,
        content: detail.caption,
        hashtags: detail.hashtags,
        image_urls: detail.imageUrls,
        carousel_urls: detail.carouselUrls,
        visual_url: detail.visualUrl,
        pdf_url: detail.pdfUrl,
      });
      toast.success('Post regenerated successfully.');
      refreshQuota();
      onSuccess?.();
    };

    const onCarouselRegenerated = (event: Event) => {
      const detail = (event as CustomEvent).detail || {};
      if (!detail || detail.contentId !== content.id) return;
      const newImageUrls: string[] = Array.isArray(detail.newImageUrls)
        ? detail.newImageUrls
        : [];
      const newPdfUrl: string | undefined = detail.newPdfUrl;
      if (newImageUrls.length === 0) return;

      setCurrentCarouselUrls(newImageUrls);
      setCurrentCarouselPdfUrl(newPdfUrl || null);
      setCarouselIndex(0);
      setRegeneratingCarousel(false);
      toast.success(
        newPdfUrl
          ? 'Carousel and PDF regenerated.'
          : 'Carousel regenerated.',
      );
    };

    window.addEventListener('trndinn:image-regenerated', onImageRegenerated as EventListener);
    window.addEventListener('trndinn:carousel-regenerated', onCarouselRegenerated as EventListener);
    window.addEventListener('trndinn:post-regenerated', onPostRegenerated as EventListener);
    return () => {
      window.removeEventListener('trndinn:image-regenerated', onImageRegenerated as EventListener);
      window.removeEventListener('trndinn:carousel-regenerated', onCarouselRegenerated as EventListener);
      window.removeEventListener('trndinn:post-regenerated', onPostRegenerated as EventListener);
    };
  }, [open, content?.id, regeneratingImageIndex, onContentRegenerated, onSuccess, refreshQuota]);

  useEffect(() => {
    if (!open) return;
    if (postingIdentities.length > 0) return;
    let cancelled = false;
    const loadIdentities = async () => {
      try {
        const res = await apiClient.get('/linkedin/posting-identities');
        const identities = Array.isArray(res?.identities) ? res.identities : [];
        const mapped = identities.map((identity: any) => ({
          id: identity.id,
          actorType: identity.actorType === 'organization' ? 'organization' : 'member',
          label: extractLinkedinText(identity.label || identity.organizationName),
          organizationUrn: identity.organizationUrn,
          avatarUrl: identity.avatarUrl,
        }));
        if (cancelled) return;
        setLocalPostingIdentities(mapped);
        if (mapped.length > 0 && !localSelectedIdentityId) {
          setLocalSelectedIdentityId(res?.defaultIdentityId || mapped[0].id);
        }
      } catch {
        if (!cancelled) {
          setLocalPostingIdentities([]);
        }
      }
    };
    void loadIdentities();
    return () => {
      cancelled = true;
    };
  }, [open, postingIdentities.length, localSelectedIdentityId]);

  const linkedInFinalLength = useMemo(
    () =>
      linkedInCommentaryLength(
        editedContent || content?.content || '',
        editedHashtags,
      ),
    [editedContent, content?.content, editedHashtags],
  );
  const isLinkedInOverLimit = linkedInFinalLength > LINKEDIN_MAX_TEXT_LENGTH;

  const handleClose = () => {
    setRegenConfirmDialog(null);
    setRegenConfirmLoading(false);
    setActiveImageRegenJobId(null);
    setImageRegenProgress(null);
    setIsSchedulingExpanded(false);
    setEditedHashtags([]);
    setNewHashtagInput('');
    setUploadedImages([]);
    setUploadedPdfUrl(null);
    setUploadedPdfName(null);
    setHasConfirmedIdentityOnce(false);
    setPendingIdentityAction(null);
    onOpenChange(false);
  };

  if (!content) return null;

  const hasUploadedMedia = uploadedImages.length > 0;
  // Local-state mirrors fall back to the prop on first paint so we don't
  // flicker before `useEffect(content, open)` runs.
  const effectiveCarouselUrls: string[] = currentCarouselUrls.length > 0
    ? currentCarouselUrls
    : Array.isArray(content.carousel_urls) ? content.carousel_urls : [];
  const hasCarousel = effectiveCarouselUrls.length > 0;
  const effectivePdfUrl: string | null =
    currentCarouselPdfUrl ?? (typeof content.pdf_url === 'string' ? content.pdf_url : null);
  const effectiveImageUrls: string[] = currentImageUrls.length > 0
    ? currentImageUrls
    : Array.isArray(content.image_urls) ? content.image_urls : [];
  const imagePickerUrls: string[] = effectiveImageUrls.filter(
    (u: string) => typeof u === 'string' && u.startsWith('http'),
  );
  const effectiveVisualUrl = currentVisualUrl ?? content.visual_url;
  const resolvedVisualUrl = selectedPickerImage || effectiveVisualUrl;
  const hasSingleImage = Boolean(resolvedVisualUrl && resolvedVisualUrl.startsWith('http'));
  // Always use editedHashtags — initialized from content.hashtags on open.
  const effectiveHashtags = editedHashtags;
  const clampedCarouselIndex = Math.min(
    Math.max(carouselIndex, 0),
    Math.max(effectiveCarouselUrls.length - 1, 0),
  );

  // Regen capability flags. AI-generated content is the only thing eligible —
  // user-uploaded images and PDF-replaced posts are intentionally locked out.
  const customTopicMeta = content.performance_prediction?.customTopicMeta;
  const carouselSlideMeta = customTopicMeta?.slides;
  const imagePromptsMeta: string[] | undefined = customTopicMeta?.imagePrompts;
  const postRegenTopic = resolvePostRegenTopic(content, customTopicMeta);
  const postRegenContentType = customTopicMeta?.contentType ?? 'text';
  const postRegenImageCount =
    typeof customTopicMeta?.imageCount === 'number'
      ? customTopicMeta.imageCount
      : imagePromptsMeta?.length ?? 1;
  const postRegenSlideCount =
    typeof customTopicMeta?.slideCount === 'number'
      ? customTopicMeta.slideCount
      : Array.isArray(carouselSlideMeta)
        ? carouselSlideMeta.length
        : effectiveCarouselUrls.length || 2;
  const REGEN_TEXT_BASE_COST = DEFAULT_CREDIT_COSTS.generate.textBase;
  const postRegenCost =
    postRegenContentType === 'image'
      ? REGEN_TEXT_BASE_COST + REGEN_IMAGE_CREDIT_COST * postRegenImageCount
      : postRegenContentType === 'carousel'
        ? REGEN_TEXT_BASE_COST + REGEN_SLIDE_CREDIT_COST * postRegenSlideCount
        : REGEN_TEXT_BASE_COST;
  const postRegenAvailable =
    isCustomGeneratedPost(content, customTopicMeta) &&
    postRegenTopic.length >= 3 &&
    !readOnly;
  const carouselSlideCount =
    Array.isArray(carouselSlideMeta) ? carouselSlideMeta.length : effectiveCarouselUrls.length;
  const carouselRegenCost = REGEN_SLIDE_CREDIT_COST * carouselSlideCount;
  const isAnyRegenInFlight =
    regeneratingImageIndex !== null || regeneratingCarousel || regeneratingPost;
  const insufficientForPostRegen =
    typeof remainingCredits === 'number' && remainingCredits < postRegenCost;

  const executeRegeneratePost = async () => {
    if (!content?.id) return;

    try {
      setRegeneratingPost(true);
      const res = await api.generation.regeneratePost(content.id, { includeBrandKit });
      toast.success(
        res?.message || `Post regeneration started — ${postRegenCost} credits reserved.`,
      );
      refreshQuota();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to start post regeneration';
      toast.error(errorMessage);
      setRegeneratingPost(false);
    }
  };

  const promptRegeneratePost = () => {
    if (!content?.id) return;
    if (isAnyRegenInFlight) return;
    if (postRegenTopic.length < 3) {
      toast.error(
        'Original topic not saved on this post. Generate a new post from the Agent instead.',
      );
      return;
    }
    if (insufficientForPostRegen) {
      toast.error(
        `Need ${postRegenCost} credits to regenerate this post (you have ${remainingCredits ?? 0}).`,
      );
      return;
    }

    const topicPreview = `${postRegenTopic.slice(0, 120)}${postRegenTopic.length > 120 ? '…' : ''}`;

    setRegenConfirmDialog({
      title: 'Regenerate the full post?',
      description: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Rewrites the caption and all images from the same topic.</p>
          <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 space-y-1.5">
            <p>
              <span className="font-medium text-foreground">Topic:</span>{' '}
              {topicPreview}
            </p>
            <p>
              <span className="font-medium text-foreground">Brand kit:</span>{' '}
              {includeBrandKit ? 'ON (full voice + visuals)' : 'OFF (vocabulary + past posts only)'}
            </p>
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              Cost: {postRegenCost}
              <Coins className="h-3.5 w-3.5" />
            </p>
          </div>
        </div>
      ),
      confirmLabel: 'Regenerate post',
      onConfirm: executeRegeneratePost,
    });
  };

  const carouselRegenAvailable =
    hasCarousel &&
    Array.isArray(carouselSlideMeta) &&
    carouselSlideMeta.length > 0 &&
    !uploadedPdfUrl;
  const imageRegenAvailable = (idx: number): boolean => {
    const prompts =
      currentImagePrompts.length > 0
        ? currentImagePrompts
        : Array.isArray(imagePromptsMeta)
          ? imagePromptsMeta
          : [];
    if (prompts.length === 0) return false;
    if (idx < 0 || idx >= imagePickerUrls.length) return false;
    const sourcePromptIdx = Math.min(idx, prompts.length - 1);
    if (!String(prompts[sourcePromptIdx] || '').trim()) return false;
    if (uploadedPdfUrl) return false;
    return true;
  };
  const insufficientForImage =
    typeof remainingCredits === 'number' && remainingCredits < REGEN_IMAGE_CREDIT_COST;
  const insufficientForCarousel =
    typeof remainingCredits === 'number' && remainingCredits < carouselRegenCost;
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Your Name";
  const userInitial = displayName.charAt(0).toUpperCase();
  const effectivePostingIdentities =
    postingIdentities.length > 0 ? postingIdentities : localPostingIdentities;
  const effectiveSelectedIdentityId =
    postingIdentities.length > 0 ? selectedPostingIdentityId : localSelectedIdentityId;
  const selectedIdentity =
    effectivePostingIdentities.find((i) => i.id === effectiveSelectedIdentityId) || null;
  const isBusy = isPublishing || isSubmittingAction;

  const handleSelectIdentity = (identityId: string) => {
    if (postingIdentities.length > 0 && onSelectPostingIdentity) {
      onSelectPostingIdentity(identityId);
      return;
    }
    setLocalSelectedIdentityId(identityId);
  };

  const ensureIdentityConfirmed = (action: 'publish' | 'schedule'): boolean => {
    if (hasConfirmedIdentityOnce || effectivePostingIdentities.length === 0) return true;
    setPendingIdentityAction(action);
    setShowIdentityModal(true);
    return false;
  };

  const ensureLinkedInLengthOk = (): boolean => {
    const body = editedContent || content.content || '';
    if (!isLinkedInCommentaryWithinLimit(body, effectiveHashtags)) {
      toast.error(formatLinkedInLengthError(linkedInFinalLength));
      return false;
    }
    return true;
  };

  const publishNow = async (skipIdentityGate = false) => {
    // Check LinkedIn connection before publishing
    if (!showConnectionRequired('linkedin', 'post')) {
      return;
    }

    if (!skipIdentityGate && !ensureIdentityConfirmed('publish')) return;
    
    // Validate content for own content mode
    if (content.isOwnContent && (!editedContent || editedContent.trim().length === 0)) {
      toast.error('Please enter your content before posting');
      return;
    }

    if (!ensureLinkedInLengthOk()) return;
    
    try {
      setIsPublishing(true);
      
      let contentId = content.id;
      
      // For "own content" mode, first create the content record
      if (content.isOwnContent) {
        const createResponse = await apiClient.post('/generation/content/create-own', {
          content: editedContent.trim(),
          title: 'Your Content',
          hashtags: effectiveHashtags,
          mediaUrls: uploadedImages.length > 0 ? uploadedImages : undefined,
          pdfUrl: uploadedPdfUrl || undefined,
        });
        
        if (!createResponse.success || !createResponse.content?.id) {
          throw new Error('Failed to create content record');
        }
        contentId = createResponse.content.id;
      }
      
      await apiClient.post('/posts/publish', {
        contentId,
        content: editedContent || content.content,
        hashtags: effectiveHashtags,
        mediaUrls: uploadedImages,
        ...(uploadedPdfUrl ? { pdfUrl: uploadedPdfUrl } : {}),
        actorType: selectedIdentity?.actorType || postingTarget?.actorType,
        organizationUrn:
          selectedIdentity?.organizationUrn || postingTarget?.organizationUrn,
      });
      toast.success('Post published successfully!');
      handleClose();
      refreshQuota();
      dispatchFeedbackEligibilityRefresh();
      onSuccess?.();
    } catch (error: any) {
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

  const scheduleNow = async (skipIdentityGate = false) => {
    // Check LinkedIn connection before scheduling
    if (!showConnectionRequired('linkedin', 'schedule')) {
      return;
    }

    if (!skipIdentityGate && !ensureIdentityConfirmed('schedule')) return;
    
    // Validate content for own content mode
    if (content.isOwnContent && (!editedContent || editedContent.trim().length === 0)) {
      toast.error('Please enter your content before scheduling');
      return;
    }

    if (!ensureLinkedInLengthOk()) return;
    
    try {
      setIsSubmittingAction(true);
      const scheduledIso = new Date(scheduleDateTime).toISOString();
      
      let contentId = content.id;
      
      // For "own content" mode, first create the content record
      if (content.isOwnContent) {
        const createResponse = await apiClient.post('/generation/content/create-own', {
          content: editedContent.trim(),
          title: 'Your Content',
          hashtags: effectiveHashtags,
          mediaUrls: uploadedImages.length > 0 ? uploadedImages : undefined,
          pdfUrl: uploadedPdfUrl || undefined,
        });
        
        if (!createResponse.success || !createResponse.content?.id) {
          throw new Error('Failed to create content record');
        }
        contentId = createResponse.content.id;
      }
      
      await apiClient.post('/posts/schedule', {
        contentId,
        scheduledFor: scheduledIso,
        timezone: userTimezone,
        content: editedContent,
        hashtags: effectiveHashtags,
        mediaUrls: uploadedImages,
        ...(uploadedPdfUrl ? { pdfUrl: uploadedPdfUrl } : {}),
        actorType: selectedIdentity?.actorType || postingTarget?.actorType,
        organizationUrn:
          selectedIdentity?.organizationUrn || postingTarget?.organizationUrn,
      });
      const scheduledTime = formatInTimezone(scheduledIso, userTimezone);
      toast.success(`Post scheduled for ${scheduledTime} (${userTimezone})`);
      handleClose();
      refreshQuota();
      dispatchFeedbackEligibilityRefresh();
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to schedule post';
      if (errorMessage.includes('Insufficient credits') || errorMessage.includes('upgrade your plan')) {
        toast.error(errorMessage, { duration: 5000 });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const regeneratePostButton = (
    className?: string,
    size: 'sm' | 'default' = 'sm',
  ) =>
    postRegenAvailable ? (
      <Button
        variant="outline"
        size={size}
        className={cn('gap-1.5', className)}
        onClick={() => promptRegeneratePost()}
        disabled={isAnyRegenInFlight || isBusy || insufficientForPostRegen}
      >
        <RefreshCw className={cn('h-3.5 w-3.5', regeneratingPost && 'animate-spin')} />
        {regeneratingPost ? 'Regenerating post…' : `Regenerate post (${postRegenCost}`}
        {!regeneratingPost && <Coins className="h-3 w-3" />}
        {!regeneratingPost && <span>)</span>}
      </Button>
    ) : null;

  const expandedRegeneratePostSection =
    isSchedulingExpanded && postRegenAvailable ? (
      <div className="rounded-lg border border-violet-500/35 bg-violet-500/5 p-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/15">
            <RefreshCw className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="text-sm font-semibold text-foreground">Regenerate full post</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Rewrites the caption and all images from the same topic. Brand kit is{' '}
              <span className="font-medium text-foreground">
                {includeBrandKit ? 'ON' : 'OFF'}
              </span>
              . Hover the image on the left to regenerate a single image only.
            </p>
            {insufficientForPostRegen && (
              <p className="text-xs text-destructive">
                Need {postRegenCost} credits — you have {remainingCredits ?? 0}.
              </p>
            )}
          </div>
        </div>
        {regeneratePostButton('w-full h-11', 'default')}
      </div>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {isBusy && (
        <div className="fixed inset-0 z-[120] bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="rounded-xl border bg-card px-6 py-5 shadow-lg min-w-[280px] text-center">
            <Calendar className="h-6 w-6 mx-auto mb-3 animate-pulse text-primary" />
            <p className="font-medium">
              {isPublishing ? "Publishing post..." : "Scheduling post..."}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Please wait while we complete this action.
            </p>
          </div>
        </div>
      )}
      <DialogContent
        className={`w-[calc(100vw-1rem)] sm:w-full ${isSchedulingExpanded ? 'max-w-4xl' : 'max-w-[560px]'} max-h-[90vh] overflow-hidden p-0 gap-0 rounded-xl border border-border/60 shadow-xl [&>button]:hidden transition-all duration-300`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Content Preview</DialogTitle>
        </DialogHeader>

        <div className={`flex ${isSchedulingExpanded ? 'flex-col sm:flex-row' : 'flex-col'} max-h-[90vh] bg-card`} style={{ maxWidth: '100%' }}>
          {/* LinkedIn Preview Panel */}
          <div className={`${isSchedulingExpanded ? 'w-full sm:w-1/2 sm:border-r border-border overflow-hidden' : 'w-full'} flex flex-col ${isSchedulingExpanded ? 'max-h-[45vh] sm:max-h-[90vh]' : 'max-h-[90vh]'}`}>
            <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ maxWidth: '100%' }}>
              {/* Header */}
              <div className="flex items-start gap-2 p-4 pb-0" style={{ maxWidth: '100%' }}>
                <Avatar className="h-11 w-11 shrink-0 sm:h-12 sm:w-12">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-base font-bold sm:text-lg">
                    {userInitial || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 overflow-hidden pt-0.5">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[13px] sm:text-sm text-foreground truncate block">
                      {displayName}
                    </span>
                    <span className="text-[11px] sm:text-xs text-muted-foreground shrink-0">· 3rd+</span>
                  </div>

                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug mt-px overflow-hidden text-ellipsis whitespace-nowrap">
                    {(content.title || "Content Creator | AI Enthusiast").length > 45
                      ? (content.title || "Content Creator | AI Enthusiast").substring(0, 45) + "..."
                      : (content.title || "Content Creator | AI Enthusiast")}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground mt-px">
                    <span>2d</span>
                    <span>·</span>
                    <span>Edited</span>
                    <span>·</span>
                    <Globe className="h-3 w-3" />
                  </div>
                </div>

                <span className="text-primary text-[13px] sm:text-sm font-bold shrink-0 pt-1 cursor-pointer hover:underline">
                  + Follow
                </span>
              </div>

              {/* Body */}
              <div className="px-4 pt-3 pb-2 overflow-hidden min-w-0" style={{ maxWidth: '100%' }}>
                <div
                  className="overflow-hidden text-left break-words [overflow-wrap:anywhere] min-w-0"
                  style={{ maxWidth: '100%' }}
                >
                  {renderRichLines(
                    prepareLinkedinPreviewBody(editedContent || content.content || ''),
                  )}
                </div>

                {effectiveHashtags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-x-1" style={{ maxWidth: '100%' }}>
                    {effectiveHashtags.map((tag: string, index: number) => (
                      <span key={index} className="text-[13px] sm:text-[14px] text-primary font-semibold hover:underline cursor-pointer">
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* PDF Preview (Replaces Carousel) */}
              {uploadedPdfUrl && (
                <div className="px-4 pb-3">
                  <div className="rounded-lg overflow-hidden border border-red-200 bg-muted/10">
                    <iframe
                      src={uploadedPdfUrl}
                      className="w-full h-[420px] border-0"
                      title="PDF Preview"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-foreground">{uploadedPdfName || 'Document.pdf'}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadedPdfUrl(null);
                        setUploadedPdfName(null);
                        toast.success('PDF removed');
                      }}
                      className="h-8 text-xs gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove PDF
                    </Button>
                  </div>
                </div>
              )}

              {/* Uploaded Images Preview */}
              {!uploadedPdfUrl && hasUploadedMedia && (
                <div className="px-4 pb-3">
                  {uploadedImages.length === 1 ? (
                    <div className="relative w-full max-h-96 h-96 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={uploadedImages[0]}
                        alt="Post media"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 700px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className={cn(
                      "grid gap-2",
                      uploadedImages.length === 2 ? "grid-cols-2" : "grid-cols-2"
                    )}>
                      {uploadedImages.slice(0, 4).map((url, index) => (
                        <div key={index} className="relative aspect-square">
                          <Image
                            src={url}
                            alt={`Post media ${index + 1}`}
                            fill
                            className="rounded-lg border border-border object-cover"
                            sizes="(max-width: 768px) 50vw, 250px"
                            unoptimized
                          />
                          {index === 3 && uploadedImages.length > 4 && (
                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                              <span className="text-white text-2xl font-bold">+{uploadedImages.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Carousel Preview (LinkedIn style) */}
              {!uploadedPdfUrl && !hasUploadedMedia && hasCarousel && (
                <div className="px-4 pb-3">
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-muted/20">
                    <div className="relative w-full h-[420px]">
                      <Image
                        src={effectiveCarouselUrls[clampedCarouselIndex]}
                        alt={`Carousel slide ${clampedCarouselIndex + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 700px"
                        unoptimized
                      />
                      {regeneratingCarousel && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-white text-xs gap-2 backdrop-blur-sm">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="font-medium">Regenerating carousel…</span>
                          <span className="opacity-80">{carouselSlideCount} slides</span>
                        </div>
                      )}
                    </div>

                    {effectiveCarouselUrls.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setCarouselIndex((v) => Math.max(v - 1, 0))}
                          disabled={clampedCarouselIndex === 0}
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCarouselIndex((v) =>
                              Math.min(v + 1, effectiveCarouselUrls.length - 1),
                            )
                          }
                          disabled={clampedCarouselIndex === effectiveCarouselUrls.length - 1}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white disabled:opacity-40"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {effectiveCarouselUrls.length > 1 && (
                    <div className="mt-2 flex items-center justify-center gap-1.5">
                      {effectiveCarouselUrls.map((_: string, idx: number) => (
                        <button
                          key={`dot-${idx}`}
                          type="button"
                          onClick={() => setCarouselIndex(idx)}
                          className={cn(
                            'h-1.5 rounded-full transition-all',
                            idx === clampedCarouselIndex
                              ? 'w-5 bg-primary'
                              : 'w-1.5 bg-muted-foreground/40',
                          )}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {typeof effectivePdfUrl === 'string' && effectivePdfUrl.length > 0 && (
                    <div className="mt-2 flex items-center justify-center">
                      <a
                        href={effectivePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        View as PDF
                      </a>
                    </div>
                  )}

                  {/* Regenerate Carousel Button — only for AI carousels with persisted deck JSON. */}
                  {carouselRegenAvailable && (
                    <div className="mt-3 flex flex-col items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => promptRegenerateCarousel()}
                        disabled={
                          isAnyRegenInFlight ||
                          isBusy ||
                          insufficientForCarousel
                        }
                        title={
                          insufficientForCarousel
                            ? `Insufficient credits: need ${carouselRegenCost}, have ${remainingCredits ?? 0}`
                            : isAnyRegenInFlight
                              ? 'Another regeneration is in progress'
                              : `Regenerate ${carouselSlideCount} slides for ${carouselRegenCost} credits`
                        }
                        className="text-xs gap-1.5"
                      >
                        <RefreshCw className={cn('h-3.5 w-3.5', regeneratingCarousel && 'animate-spin')} />
                        <span>
                          {regeneratingCarousel
                            ? 'Regenerating carousel…'
                            : `Regenerate carousel (${carouselRegenCost}`}
                        </span>
                        {!regeneratingCarousel && <Coins className="h-3 w-3" />}
                        {!regeneratingCarousel && <span>)</span>}
                      </Button>
                      {insufficientForCarousel && (
                        <span className="text-[10px] text-destructive">
                          Need {carouselRegenCost} credits — you have {remainingCredits ?? 0}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* AI Generated Single Visual */}
              {!uploadedPdfUrl && !hasUploadedMedia && !hasCarousel && hasSingleImage && (
                <div className="px-4 pb-3" data-generated-visual>
                  <div className="group relative rounded-lg overflow-hidden border border-gray-200">
                    <div className="relative w-full h-[400px]">
                      <Image
                        src={resolvedVisualUrl}
                        alt="Generated visual content"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 700px"
                        unoptimized
                        onError={(e) => {
                          (e.currentTarget as unknown as HTMLElement)
                            ?.closest('[data-generated-visual]')
                            ?.remove();
                        }}
                      />
                      {(() => {
                        // Map the visible hero back to its index in imagePickerUrls
                        // so we know which AI prompt to regenerate. Falls back to 0
                        // when the visual_url isn't part of the picker list.
                        const heroIndex = Math.max(
                          imagePickerUrls.findIndex((u) => u === resolvedVisualUrl),
                          0,
                        );
                        const isHeroRegenerating = regeneratingImageIndex === heroIndex;
                        const canRegenHero = imageRegenAvailable(heroIndex);
                        return (
                          <>
                            {isHeroRegenerating && (
                              <ImageRegenOverlay progress={imageRegenProgress} />
                            )}
                            {canRegenHero && !isHeroRegenerating && (
                              <div
                                className={cn(
                                  'absolute right-2 top-2 z-20 transition-opacity',
                                  'opacity-0 group-hover:opacity-100 focus-within:opacity-100',
                                )}
                              >
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => promptRegenerateSingleImage(heroIndex)}
                                  disabled={isAnyRegenInFlight || isBusy || insufficientForImage}
                                  aria-label={`Regenerate image for ${REGEN_IMAGE_CREDIT_COST} credits`}
                                  className="h-7 px-2 text-[11px] gap-1 bg-card/95 hover:bg-card shadow-md"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  Regenerate image
                                  <span className="opacity-70 ml-0.5">{REGEN_IMAGE_CREDIT_COST}</span>
                                  <Coins className="h-2.5 w-2.5 opacity-70" />
                                </Button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  {imagePickerUrls.length > 1 && (
                    <div className="mt-2">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5">Pick the best image:</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {imagePickerUrls.map((url: string, idx: number) => {
                          const thumbIsRegenerating = regeneratingImageIndex === idx;
                          const thumbCanRegen = imageRegenAvailable(idx);
                          return (
                            <div key={idx} className="relative shrink-0 group/thumb">
                              <button
                                onClick={() => setSelectedPickerImage(url)}
                                disabled={thumbIsRegenerating}
                                className={cn(
                                  'relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all',
                                  (selectedPickerImage || effectiveVisualUrl) === url
                                    ? 'border-primary ring-2 ring-primary/30'
                                    : 'border-border hover:border-primary/50',
                                  thumbIsRegenerating && 'opacity-60 cursor-not-allowed',
                                )}
                                aria-label={`Select image ${idx + 1}`}
                              >
                                <Image
                                  src={url}
                                  alt={`Option ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                  unoptimized
                                />
                                {thumbIsRegenerating && (
                                  <ImageRegenOverlay progress={imageRegenProgress} compact />
                                )}
                              </button>
                              {thumbCanRegen && !thumbIsRegenerating && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void promptRegenerateSingleImage(idx);
                                  }}
                                  disabled={isAnyRegenInFlight || isBusy || insufficientForImage}
                                  className={cn(
                                    'absolute -top-1.5 -right-1.5 rounded-full p-1 bg-card border shadow-sm transition-opacity',
                                    'opacity-0 group-hover/thumb:opacity-100 focus:opacity-100',
                                    'disabled:opacity-30 disabled:cursor-not-allowed',
                                  )}
                                  aria-label={`Regenerate option ${idx + 1}`}
                                >
                                  <RefreshCw className="h-3 w-3 text-foreground" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Insufficient-credits hint for the hero regenerate button. */}
                  {imageRegenAvailable(0) && insufficientForImage && (
                    <p className="mt-2 text-[10px] text-center text-destructive">
                      Hover an image to regenerate. Need {REGEN_IMAGE_CREDIT_COST} credits — you have {remainingCredits ?? 0}.
                    </p>
                  )}
                </div>
              )}

              {/* Reactions */}
              <div className="px-4 py-1.5">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex -space-x-1">
                      <div className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full bg-primary flex items-center justify-center">
                        <ThumbsUp className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-primary-foreground" />
                      </div>
                      <div className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full bg-destructive flex items-center justify-center">
                        <Heart className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-destructive-foreground" />
                      </div>
                    </div>
                    <span>73</span>
                  </div>
                  <span>22 comments · 3 reposts</span>
                </div>
              </div>

              <div className="mx-4 border-t border-border" />

              {/* Action buttons */}
              <div className="flex items-center justify-around py-2 px-4">
                {[
                  { icon: ThumbsUp, label: "Like" },
                  { icon: MessageCircle, label: "Comment" },
                  { icon: Repeat2, label: "Repost" },
                  { icon: Send, label: "Send" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="flex flex-col items-center gap-0.5 py-2 px-2 sm:px-3 rounded hover:bg-muted/70 transition-colors text-muted-foreground"
                  >
                    <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                    <span className="text-[10px] sm:text-xs font-semibold leading-none">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer with Enhanced Actions - Only show when not expanded */}
            {!isSchedulingExpanded && (
              <div className="border-t border-border bg-card p-4">
                {/* AI Score and Info */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs h-6 shrink-0">
                      <Sparkles className="h-3 w-3" />
                      AI
                    </Badge>
                    {content.ai_score && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs h-6 shrink-0">Score: {content.ai_score}</Badge>
                    )}
                  </div>
                  {readOnly && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs h-6">
                      Preview Only
                    </Badge>
                  )}
                </div>

                {postingTarget && !readOnly && (
                  <div className="w-full rounded-md border bg-muted/20 px-2 py-1.5 text-[11px] text-muted-foreground mb-2">
                    Posting as:{" "}
                    <span className="font-medium text-foreground">
                      {selectedIdentity?.actorType === "organization" || postingTarget.actorType === "organization"
                        ? `Company Page (${selectedIdentity?.label || postingTarget.label || "Selected page"})`
                        : "Personal profile"}
                    </span>
                    {effectivePostingIdentities.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-2 h-6 px-2 text-[11px] border-orange-500/50 text-orange-500 hover:text-orange-400"
                        onClick={() => setShowIdentityModal(true)}
                      >
                        Change
                      </Button>
                    )}
                  </div>
                )}
                {regeneratePostButton('w-full mb-2')}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {/* Post Now Button */}
                  <Button
                    className={cn(
                      "flex-1 text-white",
                      readOnly 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                    )}
                    onClick={() => void publishNow()}
                    disabled={isBusy || readOnly || isLinkedInOverLimit}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    <span className="flex items-center">
                      {isPublishing ? 'Publishing...' : (
                        <>
                          Post Now ({calculateCreditCost(content, false)} <Coins className="h-3.5 w-3.5 ml-0.5 inline" />)
                        </>
                      )}
                    </span>
                  </Button>
                  
                  {/* Schedule Button */}
                  <Button 
                    className={cn(
                      "flex-1 text-white",
                      readOnly 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    )}
                    onClick={() => {
                      setEditedContent(stripModelAttribution(content.content || ''));
                      setEditedHashtags(content.hashtags || []);
                      setIsSchedulingExpanded(true);
                    }}
                    disabled={readOnly}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="flex items-center">
                      Schedule ({calculateCreditCost(content, true)} <Coins className="h-3.5 w-3.5 ml-0.5 inline" />)
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Scheduling Configuration Panel */}
          {isSchedulingExpanded && (
            <div className="w-full sm:w-1/2 flex flex-col bg-gradient-to-br from-background to-muted/20 border-t sm:border-t-0 border-l-0 sm:border-l border-border max-h-[45vh] sm:max-h-[90vh]">
              {/* Scheduling Header */}
              <div className="p-4 sm:p-5 border-b border-border/60 bg-card/50 backdrop-blur-sm shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight">Schedule Configuration</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Set up your post for perfect timing</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        try {
                          const response = await apiClient.post('/posts/draft', {
                            contentId: content.id,
                            content: editedContent,
                            hashtags: editedHashtags,
                            mediaUrls: uploadedImages,
                          });
                          
                          if (response.success) {
                            toast.success('Draft saved successfully!');
                            onSuccess?.();
                          }
                        } catch (error: any) {
                          toast.error(error.response?.data?.message || 'Failed to save draft');
                        }
                      }}
                      className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 gap-1.5"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Save Draft</span>
                      <span className="sm:hidden">Draft</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsSchedulingExpanded(false)}
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Scheduling Content - Scrollable */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 sm:space-y-8">
                {expandedRegeneratePostSection}

                {/* Date & Time Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h4 className="font-semibold text-foreground">When to Publish</h4>
                  </div>
                  
                  <DateTimePicker
                    value={scheduleDateTime || new Date().toISOString()}
                    onChange={setScheduleDateTime}
                    minDate={new Date().toISOString().split('T')[0]}
                    label="Schedule Date & Time"
                  />
                  
                  {/* Quick Time Presets */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'In 1 hour', hours: 1 },
                      { label: 'Tomorrow 9 AM', hours: 24, time: '09:00' },
                      { label: 'Next Monday', days: 7, time: '10:00' },
                    ].map((preset) => (
                      <Button
                        key={preset.label}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const now = new Date();
                          if (preset.hours) {
                            now.setHours(now.getHours() + preset.hours);
                          }
                          if (preset.days) {
                            now.setDate(now.getDate() + preset.days);
                          }
                          if (preset.time) {
                            const [hours, minutes] = preset.time.split(':');
                            now.setHours(parseInt(hours), parseInt(minutes));
                          }
                          setScheduleDateTime(now.toISOString());
                        }}
                        className="text-xs hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Content Customization */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
                    <h4 className="font-semibold text-foreground">Content Customization</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Edit Post Content</Label>
                    <div className="border border-border/60 rounded-lg bg-background overflow-hidden">
                      {/* Rich Text Toolbar */}
                      <div className="flex items-center justify-between p-3 border-b border-border/60 bg-muted/30">
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                            <Underline className="h-4 w-4" />
                          </Button>
                          <div className="w-px h-6 bg-border/60 mx-1" />
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                            <Smile className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                            <Hash className="h-4 w-4" />
                          </Button>
                          <div className="w-px h-6 bg-border/60 mx-1" />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 hover:bg-primary/10 hover:text-primary gap-1"
                            onClick={handleAIFormat}
                            disabled={isFormatting || editedContent.length < 20}
                            title={editedContent.length < 20 ? 'Content must be at least 20 characters' : `Format with AI (${DEFAULT_CREDIT_COSTS.aiTextFormatting} credits)`}
                          >
                            {isFormatting ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            <span className="text-xs">AI Format</span>
                          </Button>
                        </div>
                        <div
                          className={cn(
                            'text-xs',
                            isLinkedInOverLimit
                              ? 'text-destructive font-medium'
                              : 'text-muted-foreground',
                          )}
                          title="Includes hashtags appended when publishing to LinkedIn"
                        >
                          {linkedInFinalLength}/{LINKEDIN_MAX_TEXT_LENGTH}
                          {isLinkedInOverLimit ? ' — over LinkedIn limit' : ''}
                        </div>
                      </div>
                      
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        placeholder="Customize your post content..."
                        className="border-0 resize-none focus:ring-0 min-h-[140px] bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Media Upload */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <h4 className="font-semibold text-foreground">Media Upload</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Upload Custom Images</Label>
                    
                    {/* Upload Button */}
                    <div className="border-2 border-dashed border-border/60 rounded-lg p-6 hover:border-pink-500 transition-colors cursor-pointer bg-muted/20">
                      <input
                        type="file"
                        id="image-upload-schedule"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;

                          const toastId = toast.loading('Uploading images...');
                          
                          try {
                            const uploadPromises = Array.from(files).map(async (file) => {
                              const reader = new FileReader();
                              return new Promise<string>((resolve, reject) => {
                                reader.onload = async () => {
                                  try {
                                    const base64 = reader.result as string;
                                    const response = await apiClient.post('/media/upload', {
                                      image: base64,
                                      filename: file.name,
                                    });
                                    if (response && response.url) {
                                      resolve(response.url);
                                    } else {
                                      reject(new Error('No URL returned'));
                                    }
                                  } catch (error) {
                                    reject(error);
                                  }
                                };
                                reader.onerror = () => reject(new Error('Failed to read file'));
                                reader.readAsDataURL(file);
                              });
                            });

                            const urls = await Promise.all(uploadPromises);
                            setUploadedImages([...uploadedImages, ...urls]);
                            toast.success(`${urls.length} image(s) uploaded successfully!`, { id: toastId });
                            
                            // Reset the input
                            e.target.value = '';
                          } catch (error: any) {
                            toast.error(error.response?.data?.message || error.message || 'Failed to upload images', { id: toastId });
                          }
                        }}
                      />
                      <label htmlFor="image-upload-schedule" className="flex flex-col items-center justify-center cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-foreground">Click to upload images</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                      </label>
                    </div>

                    {/* Uploaded Images Preview */}
                    {uploadedImages.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Uploaded Images ({uploadedImages.length})</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {uploadedImages.map((url, index) => (
                            <div key={index} className="relative group rounded-lg overflow-hidden border border-border/60 aspect-square">
                              <Image
                                src={url}
                                alt={`Uploaded ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, 33vw"
                                unoptimized
                              />
                              <button
                                onClick={() => {
                                  setUploadedImages(uploadedImages.filter((_, i) => i !== index));
                                  toast.success('Image removed');
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PDF Upload Section - Adaptive: upload UI when none, status card when uploaded */}
                    <div className="pt-3 border-t border-border/40">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-red-500" />
                        {uploadedPdfUrl ? 'PDF Document' : 'Replace with PDF Document'}
                        <Badge variant="outline" className="text-[10px] h-5 gap-1 ml-auto">
                          <Coins className="h-3 w-3" />
                          {DEFAULT_CREDIT_COSTS.pdfAddOn} credits
                        </Badge>
                      </Label>

                      {!uploadedPdfUrl ? (
                        <>
                          <div className="border-2 border-dashed border-border/60 rounded-lg p-4 hover:border-red-400 transition-colors cursor-pointer bg-muted/20">
                            <input
                              type="file"
                              id="pdf-upload-schedule"
                              accept="application/pdf"
                              className="hidden"
                              disabled={isUploadingPdf}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                if (file.size > 25 * 1024 * 1024) {
                                  toast.error('PDF file must be less than 25MB');
                                  return;
                                }

                                setIsUploadingPdf(true);
                                const toastId = toast.loading('Uploading PDF...');

                                try {
                                  const formData = new FormData();
                                  formData.append('file', file);
                                  formData.append('type', 'pdf');

                                  const response = await apiClient.post('/media/upload-pdf', formData);

                                  if (response?.url) {
                                    setUploadedPdfUrl(response.url);
                                    setUploadedPdfName(file.name);
                                    toast.success('PDF uploaded successfully! This will replace the carousel/images.', { id: toastId, duration: 4000 });
                                  } else {
                                    throw new Error('No URL returned');
                                  }
                                } catch (error: any) {
                                  toast.error(error.response?.data?.message || error.message || 'Failed to upload PDF', { id: toastId });
                                } finally {
                                  setIsUploadingPdf(false);
                                  e.target.value = '';
                                }
                              }}
                            />
                            <label htmlFor="pdf-upload-schedule" className="flex flex-col items-center justify-center cursor-pointer">
                              {isUploadingPdf ? (
                                <RefreshCw className="h-6 w-6 text-muted-foreground mb-2 animate-spin" />
                              ) : (
                                <FileText className="h-6 w-6 text-red-400 mb-2" />
                              )}
                              <p className="text-sm font-medium text-foreground">
                                {isUploadingPdf ? 'Uploading...' : 'Click to upload PDF'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">PDF up to 25MB • Replaces carousel</p>
                            </label>
                          </div>

                          {(effectiveCarouselUrls.length > 0 || effectiveVisualUrl) && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                              <span>⚠️</span>
                              PDF will replace the carousel/image as primary content
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30">
                          <FileText className="h-8 w-8 text-red-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{uploadedPdfName || 'Document.pdf'}</p>
                            <p className="text-xs text-muted-foreground">PDF replaces carousel • {DEFAULT_CREDIT_COSTS.pdfAddOn} credits on publish</p>
                          </div>
                          <input
                            type="file"
                            id="pdf-upload-schedule-replace"
                            accept="application/pdf"
                            className="hidden"
                            disabled={isUploadingPdf}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              if (file.size > 25 * 1024 * 1024) {
                                toast.error('PDF file must be less than 25MB');
                                return;
                              }

                              setIsUploadingPdf(true);
                              const toastId = toast.loading('Uploading PDF...');

                              try {
                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('type', 'pdf');

                                const response = await apiClient.post('/media/upload-pdf', formData);

                                if (response?.url) {
                                  setUploadedPdfUrl(response.url);
                                  setUploadedPdfName(file.name);
                                  toast.success('PDF replaced successfully!', { id: toastId, duration: 3000 });
                                } else {
                                  throw new Error('No URL returned');
                                }
                              } catch (error: any) {
                                toast.error(error.response?.data?.message || error.message || 'Failed to upload PDF', { id: toastId });
                              } finally {
                                setIsUploadingPdf(false);
                                e.target.value = '';
                              }
                            }}
                          />
                          <label
                            htmlFor="pdf-upload-schedule-replace"
                            className="cursor-pointer text-xs font-medium text-primary hover:underline shrink-0"
                          >
                            {isUploadingPdf ? 'Uploading...' : 'Replace'}
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedPdfUrl(null);
                              setUploadedPdfName(null);
                              toast.success('PDF removed');
                            }}
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-full transition-colors shrink-0"
                            aria-label="Remove PDF"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hashtags Management */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <h4 className="font-semibold text-foreground">Hashtags & Tags</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Current Hashtags
                      </Label>
                      {editedHashtags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {editedHashtags.map((tag, index) => (
                            <Badge
                              key={`${tag}-${index}`}
                              variant="secondary"
                              className="text-xs px-2 py-1 gap-1 pr-1"
                            >
                              {tag.startsWith('#') ? tag : `#${tag}`}
                              <button
                                type="button"
                                onClick={() =>
                                  setEditedHashtags((prev) =>
                                    prev.filter((_, i) => i !== index),
                                  )
                                }
                                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                                aria-label={`Remove ${tag}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No hashtags yet — add your own below.
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-foreground mb-2 block">
                        Add More Tags
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={newHashtagInput}
                          onChange={(e) => setNewHashtagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const parsed = parseHashtagInput(newHashtagInput);
                              if (parsed.length === 0) return;
                              setEditedHashtags((prev) => {
                                const seen = new Set(prev.map((t) => t.toLowerCase()));
                                const next = [...prev];
                                for (const tag of parsed) {
                                  if (!seen.has(tag.toLowerCase())) {
                                    seen.add(tag.toLowerCase());
                                    next.push(tag);
                                  }
                                }
                                return next;
                              });
                              setNewHashtagInput('');
                            }
                          }}
                          placeholder="e.g. googlecloud, bangalore, tech (comma or space separated)"
                          className="bg-background border-border/60 focus:border-purple-500"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0 h-9"
                          disabled={!newHashtagInput.trim()}
                          onClick={() => {
                            const parsed = parseHashtagInput(newHashtagInput);
                            if (parsed.length === 0) return;
                            setEditedHashtags((prev) => {
                              const seen = new Set(prev.map((t) => t.toLowerCase()));
                              const next = [...prev];
                              for (const tag of parsed) {
                                if (!seen.has(tag.toLowerCase())) {
                                  seen.add(tag.toLowerCase());
                                  next.push(tag);
                                }
                              }
                              return next;
                            });
                            setNewHashtagInput('');
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Press Enter or click Add. Tags appear in the preview and are sent when you publish or schedule.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Platform Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <h4 className="font-semibold text-foreground">Platform Settings</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">in</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">LinkedIn</p>
                          <p className="text-xs text-muted-foreground">Professional Network</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Connected
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-6 border-t border-border/60 bg-card/30 backdrop-blur-sm space-y-3 shrink-0">
                {regeneratePostButton('w-full h-11', 'default')}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => void scheduleNow()}
                    disabled={!scheduleDateTime || isBusy || isLinkedInOverLimit}
                    className="flex-1 min-w-0 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="flex items-center">
                      Schedule Post ({calculateCreditCost(content, true)} <Coins className="h-4 w-4 ml-0.5 inline" />)
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void publishNow()}
                    disabled={isBusy || isLinkedInOverLimit}
                    className="flex-1 min-w-0 h-12 px-4 border-2 hover:bg-muted/50 font-medium transition-all"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    <span className="flex items-center">
                      Post Now ({calculateCreditCost(content, false)} <Coins className="h-4 w-4 ml-0.5 inline" />)
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      <Dialog
        open={!!regenConfirmDialog}
        onOpenChange={(open) => {
          if (!open) closeRegenConfirm();
        }}
      >
        <DialogContent
          nested
          className="max-w-md sm:max-w-md gap-4 [&>button]:hidden"
          onEscapeKeyDown={(e) => {
            if (regenConfirmLoading) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (regenConfirmLoading) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>{regenConfirmDialog?.title}</DialogTitle>
          </DialogHeader>
          {regenConfirmDialog?.description}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeRegenConfirm}
              disabled={regenConfirmLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void runRegenConfirm()}
              disabled={regenConfirmLoading}
              className="gap-1.5"
            >
              {regenConfirmLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {regenConfirmDialog?.confirmLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showIdentityModal} onOpenChange={setShowIdentityModal}>
        <DialogContent nested className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose LinkedIn account</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {effectivePostingIdentities.map((identity) => {
              const active = identity.id === effectiveSelectedIdentityId;
              const initial = (identity.label || '?').charAt(0).toUpperCase();
              return (
                <button
                  key={identity.id}
                  type="button"
                  onClick={() => handleSelectIdentity(identity.id)}
                  className={cn(
                    "w-full rounded-md border px-3 py-2.5 text-left transition-colors",
                    active ? "border-primary bg-primary/5" : "hover:bg-muted/30",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={identity.avatarUrl || ''} />
                      <AvatarFallback className="text-[10px]">{initial}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{identity.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {identity.actorType === 'organization' ? 'Company Page' : 'Personal profile'}
                      </p>
                    </div>
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowIdentityModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={async () => {
                setHasConfirmedIdentityOnce(true);
                const nextAction = pendingIdentityAction;
                setPendingIdentityAction(null);
                setShowIdentityModal(false);
                if (nextAction === "publish") {
                  await publishNow(true);
                }
                if (nextAction === "schedule") {
                  await scheduleNow(true);
                }
              }}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}