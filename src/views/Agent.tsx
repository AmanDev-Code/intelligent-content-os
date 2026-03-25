import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  Eye,
  ArrowRight,
  Copy,
  BarChart3,
  Bold,
  Italic,
  Underline,
  Smile,
  Upload,
  Trash2,
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
import { DateTimePicker } from "@/components/ui/datetime-picker";

const contentTypes = [
  { id: 'post', label: 'Text Post', icon: FileText, description: 'LinkedIn text post' },
  { id: 'image', label: 'Image Post', icon: ImageIcon, description: 'Post with AI-generated image' },
  { id: 'carousel', label: 'Carousel', icon: Layers, description: 'Multi-slide carousel post' },
];

export default function Agent() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('post');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedTrending, setSelectedTrending] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<'trending' | 'custom'>('trending');
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [recentGenerations, setRecentGenerations] = useState<any[]>([]);
  const [totalGenerationsCount, setTotalGenerationsCount] = useState<number>(0);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showHashtagsModal, setShowHashtagsModal] = useState(false);
  const [popularHashtags, setPopularHashtags] = useState<Array<{tag: string, count: number, trend: 'up' | 'down' | 'stable'}>>([]);
  const [loadingHashtags, setLoadingHashtags] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
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

  const fetchRecentGenerations = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('Fetching recent generations for user:', user.id);
      
      // Get first page (3 most recent items) - show all completed content
      const paginatedData = await dataService.getPaginatedContent(user.id, 1, 3);
      const posts = paginatedData.data || [];
      
      console.log('Recent generations data:', posts.length, 'items');
      
      setRecentGenerations(posts);
      setTotalGenerationsCount(paginatedData.pagination.total || 0);
    } catch (error) {
      console.error('Error fetching recent generations:', error);
      setRecentGenerations([]);
      setTotalGenerationsCount(0);
    }
  }, [user?.id]);

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
        setGeneratedContent([content]); // Set as array since our state expects an array
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching content by ID:', error);
      return false;
    }
  }, []);

  const fetchPopularHashtags = useCallback(async () => {
    if (!user?.id) return;
    
    setLoadingHashtags(true);
    try {
      // Fetch user's generated content to analyze hashtags
      const response = await dataService.getPaginatedContent(user.id, 1, 50);
      const allHashtags: string[] = [];
      
      response.data.forEach(content => {
        if (content.hashtags) {
          allHashtags.push(...content.hashtags);
        }
      });
      
      // Count hashtag frequency
      const hashtagCount = allHashtags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Sort by frequency and create trending data
      const sortedHashtags = Object.entries(hashtagCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15)
        .map(([tag, count]) => ({
          tag,
          count,
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down' as 'up' | 'down' | 'stable'
        }));
      
      setPopularHashtags(sortedHashtags);
    } catch (error) {
      console.error('Error fetching popular hashtags:', error);
      setPopularHashtags([]);
    } finally {
      setLoadingHashtags(false);
    }
  }, [user?.id]);

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
        const content = await api.generation.jobContent(jobId);
        console.log('Content received:', content.length, 'items');
        
        // Update all states
        setGeneratedContent(content);
        setTarget(100);
        setIsComplete(true);
        setIsGenerating(false);
        setIsLoadingContent(false);
        setStage("Completed");
        
        if (content.length > 0) {
          toast.success(`Generated ${content.length} content piece(s)!`);
        } else {
          toast.error("Content not found. Please try refresh.");
        }
        
        setTimeout(() => setJobId(null), 5000);
        fetchRecentGenerations();
        await refreshQuota(); // Refresh credits everywhere (sidebar, header, dashboard, billing)
      } catch (error) {
        console.error('Error in handleComplete:', error);
        setTarget(100);
        setIsComplete(true);
        setIsGenerating(false);
        setIsLoadingContent(false);
        setStage("Error");
        toast.error("Failed to load content");
      }
    },
    [setTarget, jobId, fetchRecentGenerations, refreshQuota]
  );

  const handleFailed = useCallback(
    (error: string | null) => {
      console.log('❌ Job failed:', error);
      setIsGenerating(false);
      setIsComplete(true); // Mark as complete so we can show retry
      setIsFailed(true); // Mark as failed
      setTarget(0);
      setStage("Failed");
      setGeneratedContent([]); // Clear any previous content
      toast.error(`Generation failed: ${error || 'Unknown error'}. You can retry.`);
    },
    [setTarget]
  );

  const handleProgress = useCallback((progress: number, currentStage: string | null) => {
    setTarget(progress);
    setStage(currentStage);
  }, [setTarget]);

  useGenerationJob({
    jobId,
    onComplete: handleComplete,
    onFailed: handleFailed,
    onProgress: handleProgress,
  });


  useEffect(() => {
    if (user) {
      fetchRecentGenerations();
    }
  }, [user, fetchRecentGenerations]);


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
      await refreshQuota();
      
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
      await refreshQuota();
    }
  };

  const handleGenerate = async () => {
    // For trending mode, first check if we need to generate topics
    if (generationMode === 'trending' && generatedContent.length === 0) {
      await generateViralTopics();
      return;
    }

    if (isGenerating) {
      toast.error("A job is already running. Please wait for it to complete.");
      return;
    }

    if (generationMode === 'custom' && !customTopic.trim()) {
      toast.error("Please enter a topic to generate content");
      return;
    }
    
    if (generationMode === 'trending' && selectedTrending === null) {
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

  const previewContent = (selectedContent?.content ?? "")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1: $2")
    .replace(/\((https?:\/\/[^\s)]+)\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Publishing functions
  const handlePublishNow = async (content: any) => {
    try {
      setIsPublishing(true);
      
      // First generate media if needed
      if (selectedType === 'image') {
        const mediaResponse = await apiClient.post('/media/generate-image', {
          prompt: content.visual?.imagePrompt || `Professional image for: ${content.title}`,
          contentId: content.id,
        });
        
        if (!mediaResponse.success) {
          throw new Error('Failed to generate image');
        }
      } else if (selectedType === 'carousel') {
        const slides = content.visual?.carouselSlides || [
          {
            headline: content.title,
            body: content.content.substring(0, 100),
            imagePrompt: `Professional image for: ${content.title}`,
          }
        ];
        
        const mediaResponse = await apiClient.post('/media/generate-carousel', {
          slides,
          contentId: content.id,
        });
        
        if (!mediaResponse.success) {
          throw new Error('Failed to generate carousel');
        }
      }

      // Publish the post
      const publishResponse = await apiClient.post('/posts/publish', {
        contentId: content.id,
        platform: 'linkedin',
      });

      if (publishResponse.success) {
        toast.success('Post published successfully to LinkedIn!');
        fetchRecentGenerations(); // Refresh the list
        refreshQuota(); // IMMEDIATE QUOTA REFRESH
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
      
      // First generate media if needed
      if (selectedType === 'image') {
        const mediaResponse = await apiClient.post('/media/generate-image', {
          prompt: selectedContentForAction.visual?.imagePrompt || `Professional image for: ${selectedContentForAction.title}`,
          contentId: selectedContentForAction.id,
        });
        
        if (!mediaResponse.success) {
          throw new Error('Failed to generate image');
        }
      } else if (selectedType === 'carousel') {
        const slides = selectedContentForAction.visual?.carouselSlides || [
          {
            headline: selectedContentForAction.title,
            body: selectedContentForAction.content.substring(0, 100),
            imagePrompt: `Professional image for: ${selectedContentForAction.title}`,
          }
        ];
        
        const mediaResponse = await apiClient.post('/media/generate-carousel', {
          slides,
          contentId: selectedContentForAction.id,
        });
        
        if (!mediaResponse.success) {
          throw new Error('Failed to generate carousel');
        }
      }

      // Schedule the post
      const scheduleResponse = await apiClient.post('/posts/schedule', {
        contentId: selectedContentForAction.id,
        scheduledFor: scheduleDateTime,
        platform: 'linkedin',
      });

      if (scheduleResponse.success) {
        const scheduledTime = new Date(scheduleDateTime).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        toast.success(`Post scheduled for ${scheduledTime} IST`);
        setShowScheduleDialog(false);
        setScheduleDateTime('');
        setSelectedContentForAction(null);
        fetchRecentGenerations(); // Refresh the list
        refreshQuota(); // IMMEDIATE QUOTA REFRESH
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

  const openScheduleDialog = (content: any) => {
    setSelectedContentForAction(content);
    setShowScheduleDialog(true);
    // Set default to 1 hour from now
    const defaultTime = new Date();
    defaultTime.setHours(defaultTime.getHours() + 1);
    setScheduleDateTime(defaultTime.toISOString().slice(0, 16));
  };

  return (
    <div className="flex-1 space-y-4 sm:space-y-6">
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

                  {/* Progress Display - Always visible when generating */}
                  {isGenerating && (
                    <div className="space-y-4">
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
                            {isComplete ? "Topics Generated!" : "Generating Viral Topics"}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {stage || "AI is analyzing trending content and generating viral topics for you..."}
                          </p>
                          
                          {/* Progress Bar */}
                          <div className="w-full max-w-md mx-auto">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{Math.round(displayProgress)}%</span>
                            </div>
                            <Progress value={displayProgress} className="h-2" />
                          </div>
                          
                          {/* Job Status */}
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

                  {/* Loading Content State */}
                  {isLoadingContent && (
                    <div className="space-y-4">
                      <div className="p-8 border-2 border-dashed border-primary/30 rounded-lg text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                          </div>
                          <div>
                            <h3 className="font-medium mb-1 text-lg">Finalizing Content...</h3>
                            <p className="text-sm text-muted-foreground">
                              Please wait while we retrieve your generated content
                            </p>
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
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          <span className="hidden sm:inline">Generated content from this job - click to view</span>
                          <span className="sm:hidden">Generated content - tap to view</span>
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={generateViralTopics}
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
                                onClick={() => handlePublishNow(content)}
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
                                onClick={() => {
                                  setSelectedContent(content);
                                  setShowContentModal(true);
                                  setIsSchedulingExpanded(true);
                                  setEditedContent(content.content || '');
                                  setEditedHashtags(content.hashtags || []);
                                  setUploadedImages(content.media_urls || []);
                                }}
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
                        onClick={generateViralTopics}
                        disabled={isGenerating}
                        className="bg-primary text-primary-foreground"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Viral Topics
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="custom-topic">Enter Your Topic</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-80">
                            <div className="space-y-3">
                              <div className="font-medium flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Pro Tips
                              </div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <p className="font-medium">Trending topics perform better</p>
                                  <p className="text-muted-foreground">Content based on trending topics gets 3x more engagement</p>
                                </div>
                                <div>
                                  <p className="font-medium">Add personal insights</p>
                                  <p className="text-muted-foreground">Edit generated content to include your unique perspective</p>
                                </div>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Textarea
                      id="custom-topic"
                      placeholder="e.g., 'The future of AI in healthcare', 'Remote work productivity tips', 'Startup funding strategies'..."
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI will research your topic across the web and create original, strategic content with insights and analysis.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Generate Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full gradient-primary text-lg py-6"
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
                    {generationMode === 'trending' 
                      ? (generatedContent.length > 0 && selectedTrending ? 'Generate Content' : 'Find Viral Topic')
                      : 'Generate Content'
                    }
                  </>
                )}
              </Button>
              <p className="text-center text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
                This will use 1.5 <Coins className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline" /> • Generation takes 30-60 seconds
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
                        {(() => {
                          const status = generation.publish_status || generation.status || 'ready';
                          const statusMap: Record<string, { label: string; classes: string }> = {
                            ready: { label: 'Ready', classes: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
                            published: { label: 'Published', classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
                            scheduled: { label: 'Scheduled', classes: 'bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary' },
                            draft: { label: 'Draft', classes: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
                            failed: { label: 'Failed', classes: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
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
                onClick={() => {
                  setShowHashtagsModal(true);
                  fetchPopularHashtags();
                }}
              >
                <div className="flex items-center">
                  <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="truncate">Popular Hashtags</span>
                </div>
                <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
                  {Array.from(new Set(recentGenerations.flatMap(g => g.hashtags || []))).length || 0}
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              Popular Hashtags
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Based on your generated content and trending topics
            </p>
          </DialogHeader>

          <div className="overflow-y-auto">
            {loadingHashtags ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Analyzing your hashtags...</p>
              </div>
            ) : popularHashtags.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {popularHashtags.map((hashtag, index) => (
                    <div 
                      key={hashtag.tag}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(hashtag.tag);
                        toast.success(`Copied ${hashtag.tag} to clipboard!`);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm text-primary">{index + 1}</span>
                          {hashtag.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                          {hashtag.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                          {hashtag.trend === 'stable' && <div className="w-3 h-0.5 bg-gray-400 rounded"></div>}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{hashtag.tag}</p>
                          <p className="text-xs text-muted-foreground">Used {hashtag.count} times</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Click to copy
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-muted-foreground">
                      💡 Tip: Click any hashtag to copy it to your clipboard
                    </span>
                  </div>
                  <div className="flex gap-2">
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
            ) : (
              <div className="text-center py-8">
                <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No hashtags yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate some content first to see popular hashtags
                </p>
                <Button 
                  onClick={() => {
                    setShowHashtagsModal(false);
                    // Focus on generation
                  }}
                >
                  Generate Content
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <ScheduleModal
        open={showContentModal}
        onOpenChange={setShowContentModal}
        content={selectedContent}
        onSuccess={fetchRecentGenerations}
        calculateCreditCost={calculateCreditCost}
      />
    </div>
  );
}