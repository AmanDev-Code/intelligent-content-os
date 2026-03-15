import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useQuota } from '@/contexts/QuotaContext';
import { toast } from 'sonner';
import { ScheduleModal } from '@/components/schedule/ScheduleModal';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  RotateCcw,
} from 'lucide-react';

interface ScheduledPost {
  id: string;
  content_id: string;
  job_id: string;
  user_id: string;
  scheduled_for: string;
  platform: string;
  status: 'scheduled' | 'processing' | 'published' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
  generated_content?: {
    id: string;
    title: string;
    content: string;
    hashtags: string[];
    visual_url?: string;
    ai_score?: number;
  };
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  scheduled: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200', icon: Clock, label: 'Scheduled' },
  processing: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200', icon: RefreshCw, label: 'Processing' },
  published: { color: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200', icon: CheckCircle, label: 'Published' },
  failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200', icon: XCircle, label: 'Failed' },
  cancelled: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/60 dark:text-gray-200', icon: AlertCircle, label: 'Cancelled' },
};

export default function ScheduledPosts() {
  const { user } = useAuth();
  const { refreshQuota } = useQuota();

  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'preview' | 'reschedule'>('preview');

  const fetchScheduledPosts = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(status !== 'all' && { status }),
      });

      const response = await apiClient.get(`/posts/scheduled?${params}`);
      setPosts(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledPosts(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter]);

  const handleCancelPost = async (postId: string) => {
    try {
      await apiClient.post(`/posts/scheduled/${postId}/cancel`);
      toast.success('Post cancelled successfully');
      fetchScheduledPosts(currentPage, searchTerm, statusFilter);
      refreshQuota();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await apiClient.delete(`/posts/scheduled/${postId}`);
      toast.success('Post deleted successfully');
      fetchScheduledPosts(currentPage, searchTerm, statusFilter);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const formatScheduledTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      const absMins = Math.abs(diffMins);
      if (absMins < 60) return `${absMins}m ago`;
      const absHours = Math.abs(diffHours);
      if (absHours < 24) return `${absHours}h ago`;
      return `${Math.abs(diffDays)}d ago`;
    }
    if (diffMins < 60) return `In ${diffMins}m`;
    if (diffDays === 0) return `In ${diffHours}h`;
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays}d`;
  };

  const openPreview = (post: ScheduledPost) => {
    setSelectedPost(post);
    setModalMode('preview');
    setShowModal(true);
  };

  const openReschedule = (post: ScheduledPost) => {
    setSelectedPost(post);
    setModalMode('reschedule');
    setShowModal(true);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Scheduled Posts</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage scheduled and published posts</p>
        </div>
        <Button
          onClick={() => fetchScheduledPosts(currentPage, searchTerm, statusFilter)}
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs sm:text-sm shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 sm:pl-10 text-xs sm:text-sm h-9 sm:h-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px] h-9 sm:h-10 text-xs sm:text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-2.5">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-muted rounded w-16" />
                    <div className="h-7 bg-muted rounded w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-sm sm:text-lg font-semibold mb-1.5 sm:mb-2">No posts found</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'No posts match your current filters.'
                : 'You haven\'t scheduled any posts yet.'}
            </p>
            <Button size="sm" onClick={() => window.location.href = '/agent'} className="text-xs sm:text-sm">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Schedule a Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const cfg = statusConfig[post.status] || statusConfig.scheduled;
              const StatusIcon = cfg.icon;
              const isActive = post.status === 'scheduled';
              const isPublished = post.status === 'published';
              const isFailed = post.status === 'failed' || post.status === 'cancelled';

              return (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Platform + Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded flex items-center justify-center shrink-0">
                            <Linkedin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium capitalize">{post.platform}</span>
                        </div>
                        <Badge className={`${cfg.color} text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5`}>
                          <StatusIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="space-y-1 sm:space-y-1.5">
                        <h4 className="font-medium text-xs sm:text-sm line-clamp-2 leading-snug">
                          {post.generated_content?.title || 'Untitled Post'}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed">
                          {post.generated_content?.content || 'No content available'}
                        </p>
                      </div>

                      {/* Hashtags */}
                      {post.generated_content?.hashtags && post.generated_content.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.generated_content.hashtags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-[9px] sm:text-xs px-1 sm:px-1.5 py-0">
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </Badge>
                          ))}
                          {post.generated_content.hashtags.length > 3 && (
                            <Badge variant="outline" className="text-[9px] sm:text-xs px-1 sm:px-1.5 py-0">
                              +{post.generated_content.hashtags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Time */}
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <span>{formatScheduledTime(post.scheduled_for)}</span>
                        </div>
                        <span>{new Date(post.scheduled_for).toLocaleDateString()}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 sm:gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPreview(post)}
                          className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs"
                        >
                          <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                          Preview & Edit
                        </Button>

                        {isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReschedule(post)}
                            className="h-7 sm:h-8 text-[10px] sm:text-xs"
                          >
                            <RotateCcw className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                            Reschedule
                          </Button>
                        )}

                        {isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelPost(post.id)}
                            className="text-destructive hover:text-destructive h-7 sm:h-8 text-[10px] sm:text-xs"
                          >
                            <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </Button>
                        )}

                        {isFailed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePost(post.id)}
                            className="text-destructive hover:text-destructive h-7 sm:h-8 text-[10px] sm:text-xs"
                          >
                            <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-7 sm:h-8 text-xs px-2 sm:px-3"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-7 sm:h-8 text-xs px-2 sm:px-3"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Schedule Modal for Preview/Edit and Reschedule */}
      {selectedPost && (
        <ScheduleModal
          open={showModal}
          onOpenChange={(open) => {
            setShowModal(open);
            if (!open) setSelectedPost(null);
          }}
          content={selectedPost.generated_content}
          onSuccess={() => {
            fetchScheduledPosts(currentPage, searchTerm, statusFilter);
            setShowModal(false);
            setSelectedPost(null);
          }}
          calculateCreditCost={modalMode === 'reschedule' ? () => 0 : undefined}
        />
      )}
    </div>
  );
}
