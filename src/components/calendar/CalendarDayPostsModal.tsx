import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  Layers,
  ImageIcon,
  Linkedin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScheduleModal } from '@/components/schedule/ScheduleModal';

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

interface CalendarDayPostsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  posts: CalendarPost[];
  onRefresh?: () => void;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  scheduled: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200', icon: Clock, label: 'Scheduled' },
  processing: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200', icon: Clock, label: 'Processing' },
  published: { color: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200', icon: CheckCircle2, label: 'Published' },
  failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200', icon: AlertCircle, label: 'Failed' },
  cancelled: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/60 dark:text-gray-200', icon: AlertCircle, label: 'Cancelled' },
};

const getVisualTypeIcon = (visualType?: string) => {
  switch (visualType?.toLowerCase()) {
    case 'carousel':
      return <Layers className="h-3 w-3" />;
    case 'image':
      return <ImageIcon className="h-3 w-3" />;
    default:
      return <FileText className="h-3 w-3" />;
  }
};

export function CalendarDayPostsModal({
  open,
  onOpenChange,
  date,
  posts,
  onRefresh,
}: CalendarDayPostsModalProps) {
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handlePostClick = (post: CalendarPost) => {
    if (post.content) {
      setSelectedPost(post);
      setShowPreviewModal(true);
    }
  };

  const handlePreviewClose = () => {
    setShowPreviewModal(false);
    setSelectedPost(null);
  };

  if (!date) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {formatDate(date)}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 flex-1 min-h-0 overflow-hidden">
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No posts for this day</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3 shrink-0">
                  {posts.length} post{posts.length !== 1 ? 's' : ''} on this day
                </p>
                <ScrollArea className="h-[calc(85vh-180px)] pr-4">
                  <div className="space-y-3 pb-2">
                  {posts.map((post) => {
                    const cfg = statusConfig[post.status] || statusConfig.scheduled;
                    const StatusIcon = cfg.icon;

                    return (
                      <Card
                        key={post.id}
                        className={cn(
                          'cursor-pointer transition-all hover:shadow-md hover:border-primary/30',
                          post.content ? '' : 'opacity-60 cursor-not-allowed'
                        )}
                        onClick={() => handlePostClick(post)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shrink-0">
                                <Linkedin className="h-3 w-3 text-white" />
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(post.start)}</span>
                              </div>
                            </div>
                            <Badge className={`${cfg.color} text-xs px-1.5 py-0.5`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {cfg.label}
                            </Badge>
                          </div>

                          <h4 className="font-medium text-sm line-clamp-2 mb-1">
                            {post.content?.title || post.title || 'Untitled Post'}
                          </h4>

                          {post.content?.content && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {post.content.content.substring(0, 100)}...
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {post.content?.visual_type && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0 gap-1">
                                  {getVisualTypeIcon(post.content.visual_type)}
                                  {post.content.visual_type}
                                </Badge>
                              )}
                            </div>
                            {post.content && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePostClick(post);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                                Preview
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedPost?.content && (
        <ScheduleModal
          open={showPreviewModal}
          onOpenChange={handlePreviewClose}
          content={selectedPost.content}
          onSuccess={() => {
            handlePreviewClose();
            onRefresh?.();
          }}
          calculateCreditCost={() => 0}
          readOnly={true}
        />
      )}
    </>
  );
}
