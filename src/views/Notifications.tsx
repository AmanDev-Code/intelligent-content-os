import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, CheckCheck, RefreshCw, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";
import { useNotifications } from '@/contexts/NotificationContext';
import { apiClient } from '@/lib/apiClient';
import { cn } from '@/lib/utils';

interface NotificationData {
  contentId?: string;
  jobId?: string;
  credits?: number;
  scheduledFor?: string;
  postId?: string;
  error?: string;
  [key: string]: any;
}

interface Notification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  category: 'publishing' | 'generation' | 'scheduling' | 'system' | 'credits' | 'marketing' | 'announcement';
  data: NotificationData;
  read: boolean;
  is_broadcast: boolean;
  priority: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

const NotificationIcon = ({ type }: { type: string }) => {
  const iconClass = "h-4 w-4";
  
  switch (type) {
    case 'success':
      return <CheckCircle className={cn(iconClass, "text-green-500")} />;
    case 'error':
      return <XCircle className={cn(iconClass, "text-red-500")} />;
    case 'warning':
      return <AlertCircle className={cn(iconClass, "text-yellow-500")} />;
    case 'info':
    default:
      return <Info className={cn(iconClass, "text-blue-500")} />;
  }
};

const CategoryBadge = ({ category }: { category: string }) => {
  const getVariant = (cat: string) => {
    switch (cat) {
      case 'publishing': return 'default';
      case 'generation': return 'secondary';
      case 'scheduling': return 'outline';
      case 'credits': return 'destructive';
      case 'marketing': return 'default';
      case 'announcement': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Badge variant={getVariant(category)} className="text-xs">
      {category}
    </Badge>
  );
};

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

const INITIAL_LIMIT = 20;
const LOAD_MORE_LIMIT = 10;

const Notifications = () => {
  const [filter, setFilter] = useState<string>('all');
  const [pageNotifications, setPageNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const { 
    unreadCount, 
    fetchUnreadCount,
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const fetchPageNotifications = async (pageNum: number, append: boolean, limit: number) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/notifications?page=${pageNum}&limit=${limit}`);
      
      if (response.success) {
        const newNotifications = response.data || [];
        const pagination = response.pagination || {};
        
        setPageNotifications(prev => append ? [...prev, ...newNotifications] : newNotifications);
        setTotalCount(pagination.total || 0);
        setHasMore(newNotifications.length >= limit);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = Math.floor(pageNotifications.length / LOAD_MORE_LIMIT) + 1;
      setPage(nextPage);
      fetchPageNotifications(nextPage, true, LOAD_MORE_LIMIT);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
    fetchPageNotifications(1, false, INITIAL_LIMIT);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    setPageNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    fetchUnreadCount();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setPageNotifications(prev => prev.map(n => ({ ...n, read: true })));
    fetchUnreadCount();
  };

  useEffect(() => {
    fetchPageNotifications(1, false, INITIAL_LIMIT);
  }, []);

  const localUnreadCount = pageNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your content activities
            {totalCount > 0 && ` • ${totalCount} total`}
            {localUnreadCount > 0 && ` • ${localUnreadCount} unread`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {localUnreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
          
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPageNotifications(1, false, INITIAL_LIMIT)}
              disabled={loading}
              className="text-xs"
            >
            <RefreshCw className={cn("h-3 w-3 mr-1", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notifications</SelectItem>
            <SelectItem value="publishing">Publishing</SelectItem>
            <SelectItem value="generation">Generation</SelectItem>
            <SelectItem value="scheduling">Scheduling</SelectItem>
            <SelectItem value="credits">Credits</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="announcement">Announcements</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading && pageNotifications.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        ) : pageNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">No notifications yet</h3>
              <p className="text-sm text-muted-foreground">
                You'll see notifications here when there are updates about your content.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {pageNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "transition-colors cursor-pointer hover:bg-muted/50",
                  !notification.read && "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20"
                )}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <NotificationIcon type={notification.type} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <CategoryBadge category={notification.category} />
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatTimeAgo(notification.created_at)}</span>
                        {notification.is_broadcast && (
                          <Badge variant="outline" className="text-xs">
                            Broadcast
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loading}
                  className="text-sm"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;