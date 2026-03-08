import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bell, Check, CheckCheck,
  Zap, TrendingUp, AlertTriangle, Info, Settings
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
  { id: '1', type: 'success', title: 'Content Generated Successfully', message: 'Your AI content "Future of Remote Work" has been generated and is ready for review.', timestamp: '2 minutes ago', read: false, category: 'content' },
  { id: '2', type: 'info', title: 'Post Scheduled', message: 'Your post "LinkedIn Algorithm Changes" is scheduled for tomorrow at 10:00 AM.', timestamp: '1 hour ago', read: false, category: 'content' },
  { id: '3', type: 'warning', title: 'AI Credits Running Low', message: 'You have 5 AI credits remaining. Consider upgrading your plan.', timestamp: '3 hours ago', read: false, category: 'billing' },
  { id: '4', type: 'success', title: 'LinkedIn Connected', message: 'Your LinkedIn account has been successfully connected.', timestamp: '1 day ago', read: true, category: 'social' },
  { id: '5', type: 'info', title: 'Weekly Analytics Report', message: 'Your content performance report for this week is now available.', timestamp: '2 days ago', read: true, category: 'system' },
  { id: '6', type: 'error', title: 'Content Generation Failed', message: 'Failed to generate content for "AI Trends 2026". Please try again.', timestamp: '3 days ago', read: true, category: 'content' },
];

const getNotificationIcon = (_type: string, category: string) => {
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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    const matchesRead = filter === 'all' || (filter === 'read' && n.read) || (filter === 'unread' && !n.read);
    const matchesCat = categoryFilter === 'all' || n.category === categoryFilter;
    return matchesRead && matchesCat;
  });

  const markAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  

  const readFilters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: `Unread (${unreadCount})` },
    { id: 'read', label: 'Read' },
  ];

  const catFilters = [
    { id: 'all', label: 'All' },
    { id: 'content', label: 'Content' },
    { id: 'social', label: 'Social' },
    { id: 'billing', label: 'Billing' },
    { id: 'system', label: 'System' },
  ];

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0} className="shrink-0">
          <CheckCheck className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Mark All Read</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {readFilters.map((f) => (
            <Button key={f.id} variant={filter === f.id ? "default" : "outline"} size="sm" onClick={() => setFilter(f.id as any)} className="text-xs shrink-0 h-7">
              {f.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {catFilters.map((f) => (
            <Button key={f.id} variant={categoryFilter === f.id ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter(f.id)} className="text-xs shrink-0 h-7">
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">No notifications found</h3>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread' ? "You're all caught up!" : "No notifications match your filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((n) => (
            <Card key={n.id} className={cn(!n.read && "bg-primary/5 border-primary/20")}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1.5 mt-0.5 shrink-0">
                    <div className={cn("w-2 h-2 rounded-full", getNotificationColor(n.type))} />
                    {!n.read && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                  </div>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    n.type === 'success' && "bg-green-100 text-green-600",
                    n.type === 'warning' && "bg-yellow-100 text-yellow-600",
                    n.type === 'error' && "bg-red-100 text-red-600",
                    n.type === 'info' && "bg-blue-100 text-blue-600"
                  )}>
                    {getNotificationIcon(n.type, n.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <h3 className={cn("text-sm", !n.read && "font-semibold")}>{n.title}</h3>
                          <Badge variant="secondary" className="text-[10px] capitalize">{n.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground">{n.timestamp}</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {!n.read && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markAsRead(n.id)}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteNotification(n.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
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

      {filteredNotifications.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>Showing {filteredNotifications.length} of {notifications.length}</span>
          <span>{unreadCount} unread • {notifications.length - unreadCount} read</span>
        </div>
      )}
    </div>
  );
}
