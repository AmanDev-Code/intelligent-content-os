import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter,
  Calendar,
  Zap,
  TrendingUp,
  AlertTriangle,
  Info,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'content' | 'system' | 'billing' | 'social';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Content Generated Successfully',
    message: 'Your AI content "Future of Remote Work" has been generated and is ready for review.',
    timestamp: '2 minutes ago',
    read: false,
    category: 'content'
  },
  {
    id: '2',
    type: 'info',
    title: 'Post Scheduled',
    message: 'Your post "LinkedIn Algorithm Changes" is scheduled for tomorrow at 10:00 AM.',
    timestamp: '1 hour ago',
    read: false,
    category: 'content'
  },
  {
    id: '3',
    type: 'warning',
    title: 'AI Credits Running Low',
    message: 'You have 5 AI credits remaining. Consider upgrading your plan to continue generating content.',
    timestamp: '3 hours ago',
    read: false,
    category: 'billing'
  },
  {
    id: '4',
    type: 'success',
    title: 'LinkedIn Connected',
    message: 'Your LinkedIn account has been successfully connected to ContentOS.',
    timestamp: '1 day ago',
    read: true,
    category: 'social'
  },
  {
    id: '5',
    type: 'info',
    title: 'Weekly Analytics Report',
    message: 'Your content performance report for this week is now available.',
    timestamp: '2 days ago',
    read: true,
    category: 'system'
  },
  {
    id: '6',
    type: 'error',
    title: 'Content Generation Failed',
    message: 'Failed to generate content for "AI Trends 2026". Please try again or contact support.',
    timestamp: '3 days ago',
    read: true,
    category: 'content'
  },
  {
    id: '7',
    type: 'info',
    title: 'New Feature Available',
    message: 'Check out our new carousel post feature in the AI Agent section.',
    timestamp: '1 week ago',
    read: true,
    category: 'system'
  }
];

const getNotificationIcon = (type: string, category: string) => {
  if (category === 'content') return <Zap className="h-4 w-4" />;
  if (category === 'social') return <TrendingUp className="h-4 w-4" />;
  if (category === 'billing') return <AlertTriangle className="h-4 w-4" />;
  if (category === 'system') return <Settings className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success': return 'bg-green-500';
    case 'warning': return 'bg-yellow-500';
    case 'error': return 'bg-red-500';
    default: return 'bg-blue-500';
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'content' | 'system' | 'billing' | 'social'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = filter === 'all' || 
      (filter === 'read' && notification.read) || 
      (filter === 'unread' && !notification.read);
    
    const matchesCategoryFilter = categoryFilter === 'all' || notification.category === categoryFilter;
    
    return matchesReadFilter && matchesCategoryFilter;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="flex-1 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)} className="w-auto">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications found</h3>
              <p className="text-muted-foreground">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "No notifications match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={cn(
                "transition-all duration-200 hover:shadow-md cursor-pointer",
                !notification.read && "bg-primary/5 border-primary/20"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Status Indicator */}
                  <div className="flex flex-col items-center gap-2 mt-1">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      getNotificationColor(notification.type)
                    )} />
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>

                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    notification.type === 'success' && "bg-green-100 text-green-600",
                    notification.type === 'warning' && "bg-yellow-100 text-yellow-600",
                    notification.type === 'error' && "bg-red-100 text-red-600",
                    notification.type === 'info' && "bg-blue-100 text-blue-600"
                  )}>
                    {getNotificationIcon(notification.type, notification.category)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={cn(
                            "font-medium text-sm",
                            !notification.read && "font-semibold"
                          )}>
                            {notification.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {notification.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      {filteredNotifications.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </span>
              <div className="flex items-center gap-4">
                <span>{notifications.filter(n => !n.read).length} unread</span>
                <span>{notifications.filter(n => n.read).length} read</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}