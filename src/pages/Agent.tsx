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
      
      // Get first page to get total count - filter for 'ready' status only
      const paginatedData = await dataService.getPaginatedContent(user.id, 1, 3);
      
      // Filter for only 'ready' status posts (not published, scheduled, or draft)
      const readyPosts = paginatedData.data?.filter(post => 
        post.publish_status === 'ready' || !post.publish_status
      ) || [];
      
      console.log('Recent ready generations data:', readyPosts.length, 'items');
      
      setRecentGenerations(readyPosts);
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
              <p className="text-center text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
                This will use 1.5 <Coins className="h-3.5 w-3.5 inline" /> • Generation takes 30-60 seconds
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-4 min-w-0">
          {/* Recent Generations */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 shrink-0 text-primary" />
                  <span>Recent Generations</span>
                </CardTitle>
                {totalGenerationsCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {totalGenerationsCount}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2.5">
                {recentGenerations.length > 0 ? (
                  recentGenerations.map((generation) => (
                    <div 
                      key={generation.id} 
                      className="group p-3 border rounded-lg hover:border-primary/30 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setShowContentModal(true);
                        setSelectedContent(generation);
                      }}
                    >
                      <div className="flex items-start justify-between mb-1.5 gap-2">
                        <h4 className="font-medium text-sm line-clamp-1 flex-1 group-hover:text-primary transition-colors">
                          {generation.title || 'Untitled Content'}
                        </h4>
                        <Badge 
                          variant={generation.status === 'published' ? 'default' : 'secondary'} 
                          className="text-xs shrink-0"
                        >
                          {generation.status || 'Draft'}
                        </Badge>
                      </div>
                      
                      {generation.content && (
                        <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">
                          {generation.content.substring(0, 90)}...
                        </p>
                      )}
                      
                      {generation.hashtags && generation.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {generation.hashtags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {generation.hashtags.length > 3 && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              +{generation.hashtags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3 w-3" />
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
              <p className="text-xs text-muted-foreground">Navigate to key features</p>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              <Button 
                variant="outline" 
                className="w-full justify-between h-9 text-sm hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                onClick={() => window.location.href = '/dashboard'}
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </div>
                <Badge variant="secondary" className="text-xs">
                  {recentGenerations.filter(g => g.status === 'scheduled').length || 0}
                </Badge>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-between h-9 text-sm hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                onClick={() => {
                  setShowHashtagsModal(true);
                  fetchPopularHashtags();
                }}
              >
                <div className="flex items-center">
                  <Hash className="h-4 w-4 mr-2" />
                  Popular Hashtags
                </div>
                <Badge variant="secondary" className="text-xs">
                  {Array.from(new Set(recentGenerations.flatMap(g => g.hashtags || []))).length || 0}
                </Badge>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-between h-9 text-sm hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                onClick={() => window.location.href = '/analytics'}
              >
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </div>
                <Badge variant="secondary" className="text-xs">
                  {recentGenerations.length > 0 ? Math.round(recentGenerations.reduce((acc, g) => acc + (g.ai_score || 0), 0) / recentGenerations.length) : 0}/100
                </Badge>
              </Button>
              
              {/* Quick Stats */}
              <div className="pt-2 mt-2 border-t border-border/50">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-muted/30 rounded-md">
                    <div className="font-semibold text-primary">{totalGenerationsCount || 0}</div>
                    <div className="text-muted-foreground">Total Posts</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-md">
                    <div className="font-semibold text-green-600">
                      {recentGenerations.filter(g => g.status === 'published').length}
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

      {/* LinkedIn Post Preview Modal */}
      <Dialog open={showContentModal} onOpenChange={(open) => {
        setShowContentModal(open);
        if (!open) {
          setIsSchedulingExpanded(false);
          setEditedHashtags([]);
          setNewHashtagInput('');
        }
      }}>
        <DialogContent className={`w-[calc(100vw-1rem)] sm:w-full ${isSchedulingExpanded ? 'max-w-4xl' : 'max-w-[560px]'} max-h-[90vh] overflow-hidden p-0 gap-0 rounded-xl border border-border/60 shadow-xl [&>button]:hidden transition-all duration-300`}>
          <DialogHeader className="sr-only">
            <DialogTitle>Content Preview</DialogTitle>
          </DialogHeader>

          {selectedContent && (
            <div className={`flex ${isSchedulingExpanded ? 'flex-col sm:flex-row' : 'flex-col'} max-h-[90vh] bg-card`} style={{ maxWidth: '100%' }}>
              {/* LinkedIn Preview Panel */}
              <div className={`${isSchedulingExpanded ? 'w-full sm:w-1/2 sm:border-r border-border' : 'w-full'} flex flex-col ${isSchedulingExpanded ? 'max-h-[45vh] sm:max-h-[90vh]' : 'max-h-[90vh]'}`}>
                <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ maxWidth: '100%' }}>
                {/* Header */}
                <div className="flex items-start gap-2 p-4 pb-0" style={{ maxWidth: '100%' }}>
                  <Avatar className="h-11 w-11 shrink-0 sm:h-12 sm:w-12">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-base font-bold sm:text-lg">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 overflow-hidden pt-0.5">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[13px] sm:text-sm text-foreground truncate block">
                        {user?.email?.split("@")[0] || "Your Name"}
                      </span>
                      <span className="text-[11px] sm:text-xs text-muted-foreground shrink-0">· 3rd+</span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug mt-px overflow-hidden text-ellipsis whitespace-nowrap">
                      {(selectedContent.title || "Content Creator | AI Enthusiast").length > 45
                        ? (selectedContent.title || "Content Creator | AI Enthusiast").substring(0, 45) + "..."
                        : (selectedContent.title || "Content Creator | AI Enthusiast")}
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
                <div className="px-4 pt-3 pb-2 overflow-hidden" style={{ maxWidth: '100%' }}>
                  <div className="overflow-hidden" style={{ maxWidth: '100%', textAlign: 'justify' }}>
                    {previewContent.split("\n").map((line, index) => (
                      <p
                        key={index}
                        className="text-[13px] sm:text-[14px] text-foreground mb-1.5"
                        style={{
                          lineHeight: 1.5,
                          wordBreak: 'normal',
                          overflowWrap: 'normal',
                          hyphens: 'none',
                          maxWidth: '100%',
                        }}
                      >
                        {line
                          ? line.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                              /^https?:\/\//.test(part) ? (
                                <a
                                  key={i}
                                  href={part}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                  style={{ wordBreak: 'break-all' }}
                                >
                                  {part.length > 50 ? part.substring(0, 50) + "..." : part}
                                </a>
                              ) : (
                                <span key={i}>{part}</span>
                              )
                            )
                          : "\u00A0"}
                      </p>
                    ))}
                  </div>

                  {selectedContent.hashtags && selectedContent.hashtags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-x-1" style={{ maxWidth: '100%' }}>
                      {selectedContent.hashtags.map((tag: string, index: number) => (
                        <span key={index} className="text-[13px] sm:text-[14px] text-primary font-semibold hover:underline cursor-pointer">
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Uploaded Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedImages.length === 1 ? (
                        <img
                          src={uploadedImages[0]}
                          alt="Post media"
                          className="w-full rounded-lg border border-border object-cover max-h-96"
                        />
                      ) : (
                        <div className={cn(
                          "grid gap-2",
                          uploadedImages.length === 2 ? "grid-cols-2" : "grid-cols-2"
                        )}>
                          {uploadedImages.slice(0, 4).map((url, index) => (
                            <div key={index} className="relative aspect-square">
                              <img
                                src={url}
                                alt={`Post media ${index + 1}`}
                                className="w-full h-full rounded-lg border border-border object-cover"
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

                  {/* AI Generated Visual */}
                  {selectedContent.visual_url && 
                   selectedContent.visual_url.startsWith('http') && 
                   !uploadedImages.length && (
                    <div className="mt-3">
                      <img
                        src={selectedContent.visual_url}
                        alt="AI generated visual"
                        className="w-full rounded-lg border border-border object-cover max-h-96"
                        onError={(e) => {
                          // Hide image if it fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

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

                {/* Action buttons — LinkedIn mobile style */}
                <div className="flex items-center justify-around py-1 px-0">
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
                <div className="border-t border-border bg-card">
                {/* AI Score and Info */}
                <div className="px-3 py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs h-6 shrink-0">
                      <Sparkles className="h-3 w-3" />
                      AI
                    </Badge>
                    {selectedContent.ai_score && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs h-6 shrink-0">Score: {selectedContent.ai_score}</Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-3 pb-3">
                  <div className="flex gap-2">
                    {/* Post Now Button */}
                    <Button
                      className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                      onClick={async () => {
                        try {
                          setIsPublishing(true);
                          const response = await apiClient.post('/posts/publish', {
                            contentId: selectedContent.id,
                            content: editedContent || selectedContent.content,
                            mediaUrls: uploadedImages,
                          });
                          toast.success('Post published successfully!');
                          setShowContentModal(false);
                          setIsPublishing(false);
                          fetchRecentGenerations();
                          refreshQuota(); // IMMEDIATE QUOTA REFRESH
                        } catch (error: any) {
                          setIsPublishing(false);
                          toast.error(error.response?.data?.message || 'Failed to publish post');
                        }
                      }}
                      disabled={isPublishing}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      <span className="truncate flex items-center">
                        {isPublishing ? 'Publishing...' : (
                          <>
                            <span className="hidden sm:inline flex items-center">
                              Post Now ({calculateCreditCost(selectedContent, false)} <Coins className="h-3.5 w-3.5 ml-0.5 inline" />)
                            </span>
                            <span className="sm:hidden flex items-center">
                              Post ({calculateCreditCost(selectedContent, false)} <Coins className="h-3 w-3 ml-0.5 inline" />)
                            </span>
                          </>
                        )}
                      </span>
                    </Button>
                    
                    {/* Schedule Button */}
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                      onClick={() => {
                        setEditedContent(selectedContent.content || '');
                        setEditedHashtags(selectedContent.hashtags || []);
                        setIsSchedulingExpanded(true);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="truncate flex items-center">
                        <span className="hidden sm:inline flex items-center">
                          Schedule ({calculateCreditCost(selectedContent, true)} <Coins className="h-3.5 w-3.5 ml-0.5 inline" />)
                        </span>
                        <span className="sm:hidden flex items-center">
                          Schedule ({calculateCreditCost(selectedContent, true)} <Coins className="h-3 w-3 ml-0.5 inline" />)
                        </span>
                      </span>
                    </Button>
                  </div>
                </div>
                </div>
              )}
              </div>

              {/* NEW Scheduling Configuration Panel */}
              {isSchedulingExpanded && (
                <div className="w-full sm:w-1/2 flex flex-col bg-gradient-to-br from-background to-muted/20 border-t sm:border-t-0 border-l-0 sm:border-l border-border max-h-[45vh] sm:max-h-[90vh]">
                  {/* Scheduling Header */}
                  <div className="p-4 sm:p-6 border-b border-border/60 bg-card/50 backdrop-blur-sm shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground">Schedule Configuration</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Set up your post for perfect timing</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={async () => {
                            try {
                              const response = await apiClient.post('/posts/draft', {
                                contentId: selectedContent.id,
                                content: editedContent,
                                hashtags: editedHashtags,
                                mediaUrls: uploadedImages,
                              });
                              
                              if (response.success) {
                                toast.success('Draft saved successfully!');
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
                              const formatted = now.toISOString().slice(0, 16) + ':00';
                              setScheduleDateTime(formatted);
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
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <h4 className="font-semibold text-foreground">Content Customization</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground">Edit Post Content</Label>
                        <div className="border border-border/60 rounded-lg bg-background overflow-hidden">
                          {/* Rich Text Toolbar */}
                          <div className="flex items-center justify-between p-2 sm:p-3 border-b border-border/60 bg-muted/30">
                            <div className="flex items-center space-x-1 overflow-x-auto">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-muted shrink-0"
                                onClick={() => {
                                  const textarea = document.querySelector('textarea[placeholder="Customize your post content..."]') as HTMLTextAreaElement;
                                  if (textarea) {
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    const selectedText = editedContent.substring(start, end);
                                    const newText = editedContent.substring(0, start) + `**${selectedText}**` + editedContent.substring(end);
                                    setEditedContent(newText);
                                  }
                                }}
                              >
                                <Bold className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-muted shrink-0"
                                onClick={() => {
                                  const textarea = document.querySelector('textarea[placeholder="Customize your post content..."]') as HTMLTextAreaElement;
                                  if (textarea) {
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    const selectedText = editedContent.substring(start, end);
                                    const newText = editedContent.substring(0, start) + `*${selectedText}*` + editedContent.substring(end);
                                    setEditedContent(newText);
                                  }
                                }}
                              >
                                <Italic className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-muted shrink-0"
                                onClick={() => {
                                  const textarea = document.querySelector('textarea[placeholder="Customize your post content..."]') as HTMLTextAreaElement;
                                  if (textarea) {
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    const selectedText = editedContent.substring(start, end);
                                    const newText = editedContent.substring(0, start) + `__${selectedText}__` + editedContent.substring(end);
                                    setEditedContent(newText);
                                  }
                                }}
                              >
                                <Underline className="h-4 w-4" />
                              </Button>
                              <div className="w-px h-6 bg-border/60 mx-1" />
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-muted shrink-0"
                                onClick={() => {
                                  setEditedContent(editedContent + ' 😊');
                                }}
                              >
                                <Smile className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-muted shrink-0"
                                onClick={() => {
                                  setEditedContent(editedContent + ' #');
                                }}
                              >
                                <Hash className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground shrink-0 ml-2">
                              {editedContent.length}/3000
                            </div>
                          </div>
                          
                          <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            placeholder="Customize your post content..."
                            className="border-0 resize-none focus:ring-0 min-h-[120px] sm:min-h-[140px] bg-transparent"
                            maxLength={3000}
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
                            id="image-upload"
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
                                        console.log('Upload response:', response);
                                        if (response && response.url) {
                                          resolve(response.url);
                                        } else {
                                          console.error('No URL in response:', response);
                                          reject(new Error('No URL returned'));
                                        }
                                      } catch (error) {
                                        console.error('Upload error:', error);
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
                                console.error('Upload failed:', error);
                                toast.error(error.response?.data?.message || error.message || 'Failed to upload images', { id: toastId });
                              }
                            }}
                          />
                          <label htmlFor="image-upload" className="flex flex-col items-center justify-center cursor-pointer">
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
                                  <img
                                    src={url}
                                    alt={`Uploaded ${index + 1}`}
                                    className="w-full h-full object-cover"
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
                      </div>
                    </div>

                    {/* Hashtags Management */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <h4 className="font-semibold text-foreground">Hashtags & Tags</h4>
                      </div>
                      
                      <div className="space-y-3">
                        {editedHashtags && editedHashtags.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground mb-2 block">Current Hashtags</Label>
                            <div className="flex flex-wrap gap-2">
                              {editedHashtags.map((tag: string, index: number) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary" 
                                  className="text-xs px-2 py-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                                  onClick={() => {
                                    setEditedHashtags(editedHashtags.filter((_, i) => i !== index));
                                  }}
                                >
                                  {tag.startsWith("#") ? tag : `#${tag}`}
                                  <X className="h-3 w-3 ml-1" />
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <Label className="text-sm font-medium text-foreground mb-2 block">Add More Tags</Label>
                          <div className="flex gap-2">
                            <Input
                              value={newHashtagInput}
                              onChange={(e) => setNewHashtagInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newHashtagInput.trim()) {
                                    const newTags = newHashtagInput.split(',').map(t => t.trim()).filter(t => t);
                                    setEditedHashtags([...editedHashtags, ...newTags]);
                                    setNewHashtagInput('');
                                  }
                                }
                              }}
                              placeholder="Add hashtags separated by commas..."
                              className="bg-background border-border/60 focus:border-purple-500 flex-1"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (newHashtagInput.trim()) {
                                  const newTags = newHashtagInput.split(',').map(t => t.trim()).filter(t => t);
                                  setEditedHashtags([...editedHashtags, ...newTags]);
                                  setNewHashtagInput('');
                                }
                              }}
                            >
                              Add
                            </Button>
                          </div>
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
                  <div className="p-4 sm:p-6 border-t border-border/60 bg-card/30 backdrop-blur-sm shrink-0">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={async () => {
                          try {
                            setIsScheduling(true);
                            
                            // Update the content temporarily in the database
                            await apiClient.put(`/content/${selectedContent.id}`, {
                              content: editedContent,
                              hashtags: editedHashtags,
                            });
                            
                            const response = await apiClient.post('/posts/schedule', {
                              contentId: selectedContent.id,
                              scheduledFor: new Date(scheduleDateTime).toISOString(),
                              content: editedContent,
                              mediaUrls: uploadedImages,
                              hashtags: editedHashtags,
                            });
                            const scheduledTime = new Date(scheduleDateTime).toLocaleString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            });
                            toast.success(`Post scheduled for ${scheduledTime} IST`);
                            setShowContentModal(false);
                            setIsSchedulingExpanded(false);
                            setIsScheduling(false);
                            refreshQuota(); // IMMEDIATE QUOTA REFRESH
                            fetchRecentGenerations();
                          } catch (error: any) {
                            setIsScheduling(false);
                            toast.error(error.response?.data?.message || 'Failed to schedule post');
                          }
                        }}
                        disabled={!scheduleDateTime || isScheduling}
                        className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                      >
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                        <span className="truncate flex items-center">
                          {isScheduling ? 'Scheduling...' : (
                            <>
                              <span className="hidden sm:inline flex items-center">
                                Schedule Post ({calculateCreditCost(selectedContent, true)} <Coins className="h-4 w-4 ml-0.5 inline" />)
                              </span>
                              <span className="sm:hidden flex items-center">
                                Schedule ({calculateCreditCost(selectedContent, true)} <Coins className="h-3 w-3 ml-0.5 inline" />)
                              </span>
                            </>
                          )}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            setIsPublishing(true);
                            
                            // Update the content temporarily in the database
                            await apiClient.put(`/content/${selectedContent.id}`, {
                              content: editedContent,
                              hashtags: editedHashtags,
                            });
                            
                            const response = await apiClient.post('/posts/publish', {
                              contentId: selectedContent.id,
                              content: editedContent,
                              mediaUrls: uploadedImages,
                              hashtags: editedHashtags,
                            });
                            toast.success('Post published successfully!');
                            setShowContentModal(false);
                            setIsSchedulingExpanded(false);
                            setIsPublishing(false);
                            fetchRecentGenerations();
                            refreshQuota(); // IMMEDIATE QUOTA REFRESH
                          } catch (error: any) {
                            setIsPublishing(false);
                            toast.error(error.response?.data?.message || 'Failed to publish post');
                          }
                        }}
                        disabled={isPublishing}
                        className="h-12 px-4 sm:px-6 border-2 hover:bg-muted/50 font-medium transition-all text-sm sm:text-base"
                      >
                        <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                        <span className="truncate flex items-center">
                          {isPublishing ? 'Publishing...' : (
                            <>
                              <span className="hidden sm:inline flex items-center">
                                Post Now ({calculateCreditCost(selectedContent, false)} <Coins className="h-4 w-4 ml-0.5 inline" />)
                              </span>
                              <span className="sm:hidden flex items-center">
                                Post ({calculateCreditCost(selectedContent, false)} <Coins className="h-3 w-3 ml-0.5 inline" />)
                              </span>
                            </>
                          )}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* OLD Schedule Post Dialog - Replaced by enhanced modal */}
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="schedule-datetime">Select Date and Time</Label>
              <Input
                id="schedule-datetime"
                type="datetime-local"
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="mt-1"
              />
            </div>
            
            {selectedContentForAction && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-1">{selectedContentForAction.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {selectedContentForAction.content?.substring(0, 100)}...
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowScheduleDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSchedulePost}
                disabled={isScheduling || !scheduleDateTime}
                className="flex-1"
              >
                {isScheduling ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Schedule Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}