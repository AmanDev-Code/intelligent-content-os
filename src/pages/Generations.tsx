import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Clock,
  Search,
  Filter,
  ArrowLeft,
  ArrowRight,
  Calendar,
  FileText,
  ImageIcon,
  Layers,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  Bold,
  Italic,
  Underline,
  Smile,
  Hash,
  Sparkles,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Globe,
  Heart,
  Upload,
  Trash2,
  Coins,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService, type GeneratedContent, type PaginatedResponse } from '@/services/dataService';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { cn } from '@/lib/utils';
import { useQuota } from '@/contexts/QuotaContext';

const statusColors = {
  ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  published: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  scheduled: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  publishing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const contentTypeIcons = {
  text: FileText,
  image: ImageIcon,
  carousel: Layers,
  video: FileText,
};

export default function Generations() {
  const { user } = useAuth();
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedResponse<GeneratedContent>['pagination']>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
    hasPrev: false,
  });
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [isSchedulingExpanded, setIsSchedulingExpanded] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [editedHashtags, setEditedHashtags] = useState<string[]>([]);
  const [newHashtagInput, setNewHashtagInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const { refreshQuota } = useQuota();

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

  const fetchContent = useCallback(async (page: number = 1, search: string = '', status: string = 'all') => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await dataService.getPaginatedContent(user.id, page, 20);
      
      // Apply client-side filtering for now (can be moved to backend later)
      let filteredData = response.data;
      
      if (search.trim()) {
        filteredData = filteredData.filter(item => 
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.content.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (status !== 'all') {
        filteredData = filteredData.filter(item => {
          // Use publish_status for filtering, fallback to 'ready' if not set
          const itemStatus = item.publish_status || 'ready';
          return itemStatus === status;
        });
      }
      
      setContent(filteredData);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchContent(currentPage, searchTerm, statusFilter);
  }, [fetchContent, currentPage, searchTerm, statusFilter]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getContentTypeIcon = (visualType: string | null) => {
    const type = visualType || 'text';
    const IconComponent = contentTypeIcons[type as keyof typeof contentTypeIcons] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm p-0"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <span className="hidden sm:inline">
            Showing {Math.min((currentPage - 1) * pagination.limit + 1, pagination.total)} to{' '}
            {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} results
          </span>
          <span className="sm:hidden">
            {Math.min((currentPage - 1) * pagination.limit + 1, pagination.total)}-{Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="w-8 h-8 sm:w-10 sm:h-10 p-0"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          {pages}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasMore}
            className="w-8 h-8 sm:w-10 sm:h-10 p-0"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 shrink-0"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Back
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">All Generations</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
              <span className="hidden sm:inline">Manage and view all your AI-generated content</span>
              <span className="sm:hidden">View all AI content</span>
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="publishing">Publishing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-3 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : content.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No content found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start generating content to see it here'
              }
            </p>
            {searchTerm || statusFilter !== 'all' ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => window.location.href = '/agent'}>
                Generate Content
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Card 
                key={item.id} 
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => {
                  setSelectedContent(item);
                  setShowContentModal(true);
                }}
              >
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="shrink-0">
                        {getContentTypeIcon(item.visual_type)}
                      </div>
                      <Badge 
                        variant="secondary"
                        className={`${statusColors[(item.publish_status || 'ready') as keyof typeof statusColors] || statusColors.ready} text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5`}
                      >
                        {(item.publish_status || 'ready').charAt(0).toUpperCase() + (item.publish_status || 'ready').slice(1)}
                      </Badge>
                    </div>
                    {item.ai_score && (
                      <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
                        {item.ai_score}/100
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-2 sm:mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                    {item.content}
                  </p>

                  {item.hashtags && item.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                      {item.hashtags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                      {item.hashtags.length > 3 && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                          +{item.hashtags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="truncate">{formatDate(item.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">View</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && renderPagination()}
        </>
      )}

      {/* Enhanced LinkedIn Post Preview Modal */}
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
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-base font-bold sm:text-lg">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 overflow-hidden pt-0.5">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-[13px] sm:text-sm text-foreground truncate block">
                          {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Your Name"}
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
                      {(editedContent || selectedContent.content).split("\n").map((line, index) => (
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
                  </div>

                  {/* Uploaded Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="px-4 pb-3">
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
                    <div className="px-4 pb-3">
                      <div className="rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={selectedContent.visual_url} 
                          alt="Generated visual content"
                          className="w-full h-auto"
                          style={{ maxHeight: '400px', objectFit: 'cover' }}
                          onError={(e) => {
                            // Hide image if it fails to load
                            e.currentTarget.parentElement?.parentElement?.remove();
                          }}
                        />
                      </div>
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
                              fetchContent(currentPage, searchTerm, statusFilter);
                              refreshQuota(); // IMMEDIATE QUOTA REFRESH
                            } catch (error: any) {
                              setIsPublishing(false);
                              toast.error(error.response?.data?.message || 'Failed to publish post');
                            }
                          }}
                          disabled={isPublishing}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          <span className="flex items-center">
                            {isPublishing ? 'Publishing...' : (
                              <>
                                Post Now ({calculateCreditCost(selectedContent, false)} <Coins className="h-3.5 w-3.5 ml-0.5 inline" />)
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
                          <span className="flex items-center">
                            Schedule ({calculateCreditCost(selectedContent, true)} <Coins className="h-3.5 w-3.5 ml-0.5 inline" />)
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
                                // Refresh content list to show updated status
                                fetchContent(currentPage, searchTerm, statusFilter);
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
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {editedContent.length}/3000
                            </div>
                          </div>
                          
                          <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            placeholder="Customize your post content..."
                            className="border-0 resize-none focus:ring-0 min-h-[140px] bg-transparent"
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
                            id="image-upload-gen"
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
                          <label htmlFor="image-upload-gen" className="flex flex-col items-center justify-center cursor-pointer">
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
                        {selectedContent.hashtags && selectedContent.hashtags.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground mb-2 block">Current Hashtags</Label>
                            <div className="flex flex-wrap gap-2">
                              {selectedContent.hashtags.map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                                  {tag.startsWith("#") ? tag : `#${tag}`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <Label className="text-sm font-medium text-foreground mb-2 block">Add More Tags</Label>
                          <Input
                            placeholder="Add hashtags separated by commas..."
                            className="bg-background border-border/60 focus:border-purple-500"
                          />
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
                  <div className="p-6 border-t border-border/60 bg-card/30 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={async () => {
                          try {
                            const response = await apiClient.post('/posts/schedule', {
                              contentId: selectedContent.id,
                              scheduledFor: new Date(scheduleDateTime).toISOString(),
                              content: editedContent,
                              mediaUrls: uploadedImages
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
                            refreshQuota(); // IMMEDIATE QUOTA REFRESH
                          } catch (error: any) {
                            const errorMessage = error.response?.data?.message || error.message || 'Failed to schedule post';
                            
                            if (errorMessage.includes('Insufficient credits') || errorMessage.includes('upgrade your plan')) {
                              toast.error(errorMessage, { duration: 5000 });
                            } else {
                              toast.error(errorMessage);
                            }
                          }
                        }}
                        disabled={!scheduleDateTime}
                        className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                      >
                        <Calendar className="h-5 w-5 mr-2" />
                        <span className="flex items-center">
                          Schedule Post ({calculateCreditCost(selectedContent, true)} <Coins className="h-4 w-4 ml-0.5 inline" />)
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            const response = await apiClient.post('/posts/publish', {
                              contentId: selectedContent.id,
                              content: editedContent,
                              mediaUrls: uploadedImages
                            });
                            toast.success('Post published successfully!');
                            setShowContentModal(false);
                            setIsSchedulingExpanded(false);
                            refreshQuota(); // IMMEDIATE QUOTA REFRESH
                          } catch (error: any) {
                            const errorMessage = error.response?.data?.message || error.message || 'Failed to publish post';
                            
                            if (errorMessage.includes('Insufficient credits') || errorMessage.includes('upgrade your plan')) {
                              toast.error(errorMessage, { duration: 5000 });
                            } else {
                              toast.error(errorMessage);
                            }
                          }
                        }}
                        className="h-12 px-6 border-2 hover:bg-muted/50 font-medium transition-all"
                      >
                        <Send className="h-5 w-5 mr-2" />
                        <span className="flex items-center">
                          Post Now ({calculateCreditCost(selectedContent, false)} <Coins className="h-4 w-4 ml-0.5 inline" />)
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
    </div>
  );
}