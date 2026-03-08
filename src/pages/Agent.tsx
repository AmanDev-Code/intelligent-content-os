import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  ThumbsUp,
  Share
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { API_CONFIG } from "@/lib/constants";
import { useGenerationJob } from "@/hooks/useGenerationJob";
import { useSmoothProgress } from "@/hooks/useSmoothProgress";
import { dataService } from "@/services/dataService";

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
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const { displayProgress, setTarget } = useSmoothProgress();

  // Function declarations (moved before handleComplete to avoid hoisting issues)
  const fetchGeneratedContentByJobId = useCallback(async (jobId: string | null) => {
    if (!jobId || !user?.id) {
      console.log('Cannot fetch content: jobId =', jobId, 'user.id =', user?.id);
      return;
    }
    
    console.log('Fetching generated content for jobId:', jobId, 'userId:', user.id);
    
    try {
      const content = await dataService.getContentByJobId(jobId, user.id);
      console.log('Fetched content for current job:', content);
      setGeneratedContent(content);
      
      if (content.length === 0) {
        console.warn('No content found for job:', jobId);
      }
    } catch (error) {
      console.error('Error fetching generated content by job ID:', error);
    }
  }, [user?.id]);

  const fetchRecentGenerations = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('Fetching recent generations for user:', user.id);
      const content = await dataService.getRecentContent(user.id, 10);
      console.log('Recent generations data:', content?.length || 0, 'items');
      setRecentGenerations(content);
    } catch (error) {
      console.error('Error fetching recent generations:', error);
      setRecentGenerations([]);
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

  const fetchContentById = useCallback(async (contentId: string) => {
    try {
      console.log('Fetching content by ID:', contentId);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATION}/content/${contentId}`);
      if (!response.ok) {
        console.error('Failed to fetch content by ID:', response.status);
        return;
      }
      
      const content = await response.json();
      console.log('Fetched content by ID:', content);
      
      if (content) {
        setGeneratedContent([content]); // Set as array since our state expects an array
      }
    } catch (error) {
      console.error('Error fetching content by ID:', error);
    }
  }, []);

  const handleComplete = useCallback(
    (contentId: string | null) => {
      console.log('Job completed! contentId:', contentId, 'currentJobId:', currentJobId);
      
      setTarget(100);
      setIsComplete(true);
      setIsGenerating(false);
      setStage("Completed");
      
      // If we have a contentId, fetch the specific content
      if (contentId) {
        console.log('Fetching content by contentId:', contentId);
        fetchContentById(contentId);
        toast.success("Content generated successfully!");
      } else if (currentJobId) {
        // Fallback: try to fetch content by job ID (when job_id column exists)
        console.log('No contentId provided, trying to fetch by jobId:', currentJobId);
        setTimeout(async () => {
          await fetchGeneratedContentByJobId(currentJobId);
          
          if (generatedContent.length === 0) {
            console.warn('No content found for job:', currentJobId);
            toast.warning("Content generation completed but no content found. Check recent generations.");
          }
        }, 500);
        
        toast.success("Content generated successfully!");
      } else {
        console.warn('Job completed but no contentId or currentJobId available');
        toast.warning("Job completed but unable to fetch content");
      }
      
      // Clear job ID after a delay
      setTimeout(() => {
        setJobId(null);
        console.log('Cleared jobId after job completion');
      }, 3000);
      
      // Invalidate cache and refresh recent generations
      invalidateUserCache();
      fetchRecentGenerations();
    },
    [setTarget, currentJobId, fetchGeneratedContentByJobId, fetchContentById, invalidateUserCache, fetchRecentGenerations, generatedContent.length, user?.id]
  );

  const handleFailed = useCallback(
    (error: string | null) => {
      setIsGenerating(false);
      setJobId(null);
      setTarget(0);
      setStage(null);
      toast.error(`Generation failed: ${error || 'Unknown error'}`);
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
      console.log('Current user:', user);
      fetchRecentGenerations();
    }
  }, [user]);


  const generateViralTopics = async () => {
    if (isGenerating) {
      toast.error("A job is already running. Please wait for it to complete.");
      return;
    }

    setIsGenerating(true);
    setTarget(0);
    setStage("Starting topic generation...");
    setIsComplete(false);
    setGeneratedContent([]);
    setCurrentJobId(null); // Clear previous job ID

    try {
      // Use the existing /generation/start endpoint
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATION}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            jobType: 'generate_topics',
            count: 5,
            contentType: 'topics'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to start topic generation');
      }

      const data = await response.json();
      
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
      toast.error(error.message || "Failed to start topic generation. Please try again.");
      setIsGenerating(false);
      setTarget(0);
      setStage(null);
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
    setGeneratedContent([]); // Clear previous generated content
    setCurrentJobId(null); // Clear previous job ID
    
    try {
      const topic = generationMode === 'custom' 
        ? customTopic 
        : generatedContent.find(t => t.id === selectedTrending)?.title || '';

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATION}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            topic,
            contentType: selectedType,
            jobType: 'generate_content',
            source: generationMode === 'trending' ? 'trending' : 'custom'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to start content generation');
      }

      const data = await response.json();
      
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

  return (
    <div className="flex-1 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Content Agent</h1>
          <p className="text-sm text-muted-foreground">Generate strategic content from trending topics or custom ideas</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" /> 47 Credits Available
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Generation Panel */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Content Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Content Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                {contentTypes.map((type) => (
                  <div
                    key={type.id}
                    className={cn(
                      "p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md",
                      selectedType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <type.icon className="h-5 w-5" />
                      <h3 className="font-medium">{type.label}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generation Mode Tabs */}
          <Card>
            <CardHeader>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
                  <Button
                    variant={generationMode === 'trending' ? 'default' : 'outline'}
                    onClick={() => setGenerationMode('trending')}
                    className={cn("w-full sm:w-auto", generationMode === 'trending' && "bg-primary text-primary-foreground")}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Find Viral Topic
                  </Button>
                  <Button
                    variant={generationMode === 'custom' ? 'default' : 'outline'}
                    onClick={() => setGenerationMode('custom')}
                    className={cn("w-full sm:w-auto", generationMode === 'custom' && "bg-primary text-primary-foreground")}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Custom Topic
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

                  {/* No Content Found Message */}
                  {isComplete && generatedContent.length === 0 && (
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
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Generated content from this job - click to view
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={generateViralTopics}
                          disabled={isGenerating}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Generate New Content
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {generatedContent.map((content) => (
                          <div
                            key={content.id}
                            className="p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md border-border hover:border-primary/50"
                            onClick={() => {
                              setShowContentModal(true);
                              setSelectedContent(content);
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{content.title || 'Generated Content'}</h3>
                                <Badge variant="secondary" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Generated
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{content.ai_score || 'N/A'}</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {content.content?.substring(0, 150)}...
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary">{content.content_type || 'Post'}</Badge>
                              <span>•</span>
                              <span>Job ID: {content.job_id}</span>
                              <span>•</span>
                              <span className="text-primary">Click to view full content</span>
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
                    <Label htmlFor="custom-topic">Enter Your Topic</Label>
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
              <p className="text-center text-sm text-muted-foreground mt-2">
                This will use 1 AI credit • Generation takes 30-60 seconds
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Generations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Generations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentGenerations.length > 0 ? (
                  recentGenerations.map((generation) => (
                    <div 
                      key={generation.id} 
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setShowContentModal(true);
                        setSelectedContent(generation);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-2">{generation.title || 'Untitled Content'}</h4>
                        <Badge 
                          variant={generation.status === 'published' ? 'default' : 'secondary'} 
                          className="text-xs ml-2 shrink-0"
                        >
                          {generation.status || 'Draft'}
                        </Badge>
                      </div>
                      
                      {generation.content && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {generation.content.substring(0, 100)}...
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>{generation.content_type || 'Post'}</span>
                          {generation.hashtags && generation.hashtags.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{generation.hashtags.length} tags</span>
                            </>
                          )}
                        </div>
                        <span>{new Date(generation.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {generation.scheduled_for && (
                        <div className="mt-2 text-xs text-primary">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Scheduled for {new Date(generation.scheduled_for).toLocaleString()}
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-primary">
                        Click to view full content
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No recent generations</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your completed content will appear here
                    </p>
                  </div>
                )}
              </div>
              
              {recentGenerations.length > 0 && (
                <div className="pt-3 border-t">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View All Generations
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Hash className="h-4 w-4 mr-2" />
                Popular Hashtags
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="font-medium">Trending topics perform better</p>
                  <p className="text-muted-foreground mt-1">Content based on trending topics gets 3x more engagement</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="font-medium">Add personal insights</p>
                  <p className="text-muted-foreground mt-1">Edit generated content to include your unique perspective</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* LinkedIn-styled Content Modal */}
      <Dialog open={showContentModal} onOpenChange={setShowContentModal}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-2xl max-h-[86vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Generated Content Preview</DialogTitle>
          </DialogHeader>

          {selectedContent && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-card border border-border rounded-lg">
                <div className="p-3 sm:p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{user?.email?.split('@')[0] || 'Your Name'}</h3>
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">SDE | Content Creator | AI Enthusiast</p>
                      <p className="text-xs text-muted-foreground">5h • Edited</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 sm:p-4 space-y-4">
                  <div>
                    {selectedContent.content?.split('\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-3 text-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {selectedContent.hashtags && selectedContent.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedContent.hashtags.map((tag: string, index: number) => (
                        <span key={index} className="text-primary text-sm">
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-3 sm:px-4 py-2 border-t border-border">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <ThumbsUp className="h-3 w-3 text-primary-foreground" />
                        </div>
                        <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                          <Heart className="h-3 w-3 text-accent-foreground" />
                        </div>
                      </div>
                      <span>324 reactions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>23 comments</span>
                      <span>14 reposts</span>
                    </div>
                  </div>

                  <div className="flex items-center py-1 border-t border-border">
                    <Button variant="ghost" className="flex-1 h-9 gap-2 text-xs sm:text-sm">
                      <ThumbsUp className="h-4 w-4" />
                      Like
                    </Button>
                    <Button variant="ghost" className="flex-1 h-9 gap-2 text-xs sm:text-sm">
                      <MessageCircle className="h-4 w-4" />
                      Comment
                    </Button>
                    <Button variant="ghost" className="flex-1 h-9 gap-2 text-xs sm:text-sm">
                      <Repeat2 className="h-4 w-4" />
                      Repost
                    </Button>
                    <Button variant="ghost" className="flex-1 h-9 gap-2 text-xs sm:text-sm">
                      <Send className="h-4 w-4" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI Generated
                  </Badge>
                  {selectedContent.ai_score && <Badge variant="secondary">Score: {selectedContent.ai_score}</Badge>}
                  {selectedContent.job_id && (
                    <Badge variant="outline" className="text-xs">
                      Job: {selectedContent.job_id.substring(0, 8)}...
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 sm:justify-end">
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setShowContentModal(false)}>
                    Close
                  </Button>
                  <Button className="flex-1 sm:flex-none">Schedule Post</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}