import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  List,
  Grid3X3,
  MoreHorizontal,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Sparkles,
  BarChart3,
  Target,
  Activity,
  ArrowUpRight,
  Dot,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Settings,
  Filter,
  Search,
  Bell,
  Globe,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Calendar1,
  CalendarDays,
  CalendarRange,
  Layers3,
  Wand2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuota } from "@/contexts/QuotaContext";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { CalendarDayPostsModal } from "@/components/calendar/CalendarDayPostsModal";

const viewModes = [
  { id: 'day', label: 'Day', icon: Calendar1 },
  { id: 'week', label: 'Week', icon: CalendarDays },
  { id: 'month', label: 'Month', icon: CalendarRange },
  { id: 'list', label: 'List', icon: List },
];

const socialPlatforms = [
  { 
    name: 'LinkedIn', 
    color: 'from-blue-500 to-blue-600', 
    connected: true,
    followers: '2.4K',
    engagement: '8.2%',
    posts: 12
  },
  { 
    name: 'Twitter', 
    color: 'from-gray-800 to-black', 
    connected: false,
    followers: '0',
    engagement: '0%',
    posts: 0
  },
  { 
    name: 'Instagram', 
    color: 'from-pink-500 to-purple-600', 
    connected: false,
    followers: '0',
    engagement: '0%',
    posts: 0
  },
  { 
    name: 'Facebook', 
    color: 'from-blue-600 to-blue-700', 
    connected: false,
    followers: '0',
    engagement: '0%',
    posts: 0
  },
];

const mockPosts = [
  {
    id: 1,
    title: "AI Agents Are Revolutionizing Business Operations",
    content: "The future of work is here, and it's powered by AI agents that can think, learn, and execute complex tasks autonomously...",
    scheduledFor: "2026-03-07T10:00:00",
    platforms: ['LinkedIn'],
    status: 'scheduled',
    type: 'text',
    engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
    aiScore: 94,
    category: 'AI/Technology'
  },
  {
    id: 2,
    title: "The Future of Social Media Marketing in 2026",
    content: "As we move deeper into 2026, the landscape of social media marketing continues to evolve at breakneck speed...",
    scheduledFor: "2026-03-07T14:30:00",
    platforms: ['LinkedIn'],
    status: 'draft',
    type: 'carousel',
    engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
    aiScore: 87,
    category: 'Marketing'
  },
  {
    id: 3,
    title: "Building Startup Culture in Remote Teams",
    content: "Remote work has fundamentally changed how we build company culture. Here's what we've learned...",
    scheduledFor: "2026-03-08T09:15:00",
    platforms: ['LinkedIn'],
    status: 'published',
    type: 'image',
    engagement: { likes: 234, comments: 45, shares: 23, views: 5420 },
    aiScore: 82,
    category: 'Startup'
  },
];

interface CalendarPost {
  id: string;
  title: string;
  start: string;
  type: 'scheduled' | 'published';
  status: string;
  content?: {
    id: string;
    title: string;
    content: string;
    visual_type?: string;
    hashtags?: string[];
    visual_url?: string;
    ai_score?: number;
  };
}

export default function Calendar() {
  const { user } = useAuth();
  const { quota } = useQuota();
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarPosts, setCalendarPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDayPosts, setSelectedDayPosts] = useState<CalendarPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);

  const fetchCalendarPosts = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await apiClient.get('/posts/calendar', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      
      setCalendarPosts(response.events || response.data?.posts || []);
    } catch (error) {
      console.error('Error fetching calendar posts:', error);
      toast.error('Failed to load calendar posts');
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentDate]);

  useEffect(() => {
    fetchCalendarPosts();
  }, [fetchCalendarPosts]);

  const getPostsForDay = (dayNumber: number): CalendarPost[] => {
    return calendarPosts.filter((post) => {
      const postDate = new Date(post.start);
      return (
        postDate.getDate() === dayNumber &&
        postDate.getMonth() === currentDate.getMonth() &&
        postDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const handleDayClick = (dayNumber: number) => {
    const postsForDay = getPostsForDay(dayNumber);
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    setSelectedDate(clickedDate);
    setSelectedDayPosts(postsForDay);
    setShowDayModal(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const scheduledCount = calendarPosts.filter((p) => p.status === 'scheduled').length;
  const publishedCount = calendarPosts.filter((p) => p.status === 'published').length;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'draft': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <Dot className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Eye className="h-3 w-3" />;
      case 'carousel': return <Layers3 className="h-3 w-3" />;
      case 'video': return <PlayCircle className="h-3 w-3" />;
      default: return <Globe className="h-3 w-3" />;
    }
  };

  return (
    <div className="flex-1 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl shrink-0">
              <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Content Calendar</h1>
              <p className="text-sm text-muted-foreground">Your content strategy command center</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" /><span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Search className="h-4 w-4" /><span className="hidden sm:inline">Search</span>
            </Button>
            <Button className="bg-primary text-primary-foreground gap-2">
              <Wand2 className="h-4 w-4" /><span className="hidden sm:inline">Create Post</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              {loading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Scheduled Posts</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{scheduledCount}</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/20">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Published Posts</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">{publishedCount}</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Total
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{calendarPosts.length}</p>
              <p className="text-xs text-muted-foreground">Posts total</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/20">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                {quota?.remainingCredits ?? 0} Left
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">AI Credits</p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{quota?.usedCredits ?? 0}</p>
              <p className="text-xs text-muted-foreground">Used this period</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-1 sm:gap-3">
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center min-w-[140px] sm:min-w-[200px]">
                <h2 className="text-lg sm:text-2xl font-bold">{formatDate(currentDate)}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{calendarPosts.length} posts this month</p>
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm" onClick={goToToday}>
              <Target className="h-4 w-4" /> Today
            </Button>
          </div>
          
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
            {viewModes.map((mode) => (
              <Button
                key={mode.id}
                variant={currentView === mode.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView(mode.id)}
                className={cn(
                  "gap-1 sm:gap-2 transition-all text-xs sm:text-sm flex-1 sm:flex-none",
                  currentView === mode.id && "bg-primary text-primary-foreground"
                )}
              >
                <mode.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{mode.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Connected Channels */}
      <Card className="border-0">
        <CardHeader className="pb-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-xl">Social Channels</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">Manage your connected platforms</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2 self-start sm:self-center">
              <Plus className="h-4 w-4" /> Add Channel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {socialPlatforms.map((platform) => (
              <Card
                key={platform.name}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                  platform.connected 
                    ? "border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/20" 
                    : "border-dashed border-muted-foreground/30 hover:border-primary/50 bg-muted/20"
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-10",
                  platform.color
                )} />
                <CardContent className="p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold",
                      platform.color
                    )}>
                      {platform.name.charAt(0)}
                    </div>
                    {platform.connected && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Connected
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{platform.name}</h3>
                    {platform.connected ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Followers</span>
                          <span className="font-medium">{platform.followers}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Engagement</span>
                          <span className="font-medium text-green-600">{platform.engagement}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Posts</span>
                          <span className="font-medium">{platform.posts} this month</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Not connected</p>
                        <Button size="sm" variant="outline" className="w-full">
                          Connect
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modern Calendar Grid (Month View) */}
      {currentView === 'month' && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4 mb-4 sm:mb-6">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-3 border-b">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {(() => {
                const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
                const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                const today = new Date();
                const isCurrentMonthView = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
                
                return Array.from({ length: 42 }, (_, i) => {
                  const dayNumber = i - firstDayOfMonth + 1;
                  const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
                  const isToday = isCurrentMonthView && dayNumber === today.getDate();
                  const dayPosts = isCurrentMonth ? getPostsForDay(dayNumber) : [];
                  const hasPost = dayPosts.length > 0;
                  
                  return (
                    <div
                      key={i}
                      onClick={() => isCurrentMonth && handleDayClick(dayNumber)}
                      className={cn(
                        "min-h-[48px] sm:min-h-[80px] md:min-h-[140px] p-1 sm:p-2 md:p-3 rounded-md sm:rounded-xl transition-all",
                        isCurrentMonth 
                          ? "bg-card border border-border/50 cursor-pointer hover:border-primary/50 hover:shadow-sm" 
                          : "bg-muted/20 border border-transparent",
                        isToday && "ring-2 ring-primary bg-primary/5",
                        hasPost && "bg-gradient-to-br from-primary/5 to-primary/10"
                      )}
                    >
                      {isCurrentMonth && (
                        <>
                          <div className={cn(
                            "text-sm font-semibold mb-1 sm:mb-3 flex items-center justify-between",
                            isToday && "text-primary"
                          )}>
                            <span>{dayNumber}</span>
                            {hasPost && (
                              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                {dayPosts.length}
                              </Badge>
                            )}
                          </div>
                          {/* Show first 2 posts on desktop */}
                          <div className="hidden md:block space-y-1">
                            {dayPosts.slice(0, 2).map((post) => {
                              const isScheduled = post.status === 'scheduled';
                              const colorClass = isScheduled 
                                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                                : 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
                              const iconColorClass = isScheduled ? 'text-blue-600' : 'text-green-600';
                              
                              return (
                                <div key={post.id} className={`text-xs p-1.5 rounded-lg border ${colorClass}`}>
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <Clock className={`h-2.5 w-2.5 ${iconColorClass}`} />
                                    <span className="font-medium text-[10px]">
                                      {new Date(post.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </span>
                                  </div>
                                  <p className="truncate text-[10px]">{post.content?.title || post.title}</p>
                                </div>
                              );
                            })}
                            {dayPosts.length > 2 && (
                              <p className="text-[10px] text-muted-foreground text-center">+{dayPosts.length - 2} more</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modern List View */}
      {currentView === 'list' && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <List className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Content Pipeline</CardTitle>
                  <p className="text-sm text-muted-foreground">All your posts in one view</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Sort
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPosts.map((post) => (
                <Card key={post.id} className="border-0 bg-gradient-to-r from-card to-card/50 hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex flex-col items-center gap-2">
                          {getStatusIcon(post.status)}
                          <div className="w-px h-12 bg-border"></div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg leading-tight">{post.title}</h3>
                              <p className="text-muted-foreground text-sm line-clamp-2">{post.content}</p>
                            </div>
                            <Badge variant="outline" className="ml-4 gap-1">
                              {getTypeIcon(post.type)}
                              {post.type}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(post.scheduledFor).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              <span>AI Score: {post.aiScore}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {post.category}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              {post.platforms.map((platform) => (
                                <Badge key={platform} variant="outline" className="gap-1">
                                  <Globe className="h-3 w-3" />
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                            
                            {post.status === 'published' && (
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4 text-blue-500" />
                                  <span>{post.engagement.views.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-4 w-4 text-red-500" />
                                  <span>{post.engagement.likes}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4 text-blue-500" />
                                  <span>{post.engagement.comments}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Share2 className="h-4 w-4 text-green-500" />
                                  <span>{post.engagement.shares}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            post.status === 'published' ? 'default' : 
                            post.status === 'scheduled' ? 'secondary' : 
                            'outline'
                          }
                          className="capitalize"
                        >
                          {post.status}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Day Posts Modal */}
      <CalendarDayPostsModal
        open={showDayModal}
        onOpenChange={setShowDayModal}
        date={selectedDate}
        posts={selectedDayPosts}
        onRefresh={fetchCalendarPosts}
      />
    </div>
  );
}