import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
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
  const getBadgeStyles = (cat: string) => {
    switch (cat) {
      case 'publishing': 
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'generation': 
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'scheduling': 
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      case 'credits': 
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
      case 'marketing': 
        return 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800';
      case 'announcement': 
        return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
      default: 
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700';
    }
  };

  return (
    <Badge 
      className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full border",
        getBadgeStyles(category)
      )}
    >
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

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  // Load more notifications
  const loadMoreNotifications = async (pageNum: number, append: boolean = false) => {
    await fetchNotifications(pageNum, append);
    // Update hasMore based on response (you might need to modify the context to return this info)
    setHasMore(notifications.length > 0); // Simplified for now
  };

  // Load more notifications
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMoreNotifications(nextPage, true);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load notifications when opened
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(); // Always refresh when opened
    }
  }, [isOpen, fetchNotifications]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Bell Icon Button */}
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-primary/10 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notification Dropdown */}
        {isOpen && (
          <Card className="fixed sm:absolute left-2 right-2 sm:right-0 sm:left-auto top-16 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-none sm:max-w-md max-h-[calc(100vh-5rem)] sm:max-h-96 shadow-xl z-50 border rounded-lg bg-background">
          <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-sm font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Notifications 
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-5">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-8 px-2 hover:bg-primary/10"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Mark all read</span>
                    <span className="sm:hidden">All</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <>
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  {loading ? 'Loading notifications...' : 'No notifications yet'}
                </div>
                <div className="p-3 border-t bg-muted/10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/notifications');
                    }}
                    className="text-xs w-full"
                  >
                    View All Notifications
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto scrollbar-hide">
                  <div className="space-y-0">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 sm:p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors",
                          !notification.read && "bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500"
                        )}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className={cn(
                              "p-1.5 rounded-full",
                              notification.type === 'success' && "bg-green-100 dark:bg-green-950/30",
                              notification.type === 'error' && "bg-red-100 dark:bg-red-950/30",
                              notification.type === 'warning' && "bg-yellow-100 dark:bg-yellow-950/30",
                              notification.type === 'info' && "bg-blue-100 dark:bg-blue-950/30"
                            )}>
                              <NotificationIcon type={notification.type} />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-foreground leading-tight">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between gap-2">
                              <CategoryBadge category={notification.category} />
                              <span className="text-xs text-muted-foreground font-medium">
                                {formatTimeAgo(notification.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {hasMore && (
                      <div className="p-3 text-center border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={loadMore}
                          disabled={loading}
                          className="text-xs"
                        >
                          {loading ? 'Loading...' : 'Load more'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-3 border-t bg-muted/10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/notifications');
                    }}
                    className="text-xs w-full"
                  >
                    View All Notifications
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </>
  );
};

export default NotificationBell;