import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CALENDAR_VIEWS } from "@/lib/constants";

interface CalendarViewProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  posts: any[];
  onCreatePost: (date?: Date) => void;
}

export function CalendarView({ 
  currentView, 
  onViewChange, 
  currentDate, 
  onDateChange, 
  posts, 
  onCreatePost 
}: CalendarViewProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getPostsForDate = (date: Date | null) => {
    if (!date) return [];
    return posts.filter(post => {
      const postDate = new Date(post.scheduledFor);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <Card className="border-0">
        <CardContent className="p-6">
          {/* Week headers */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              const dayPosts = getPostsForDate(date);
              const isCurrentDay = isToday(date);
              const isPastDay = date ? date.getTime() < new Date(new Date().setHours(0, 0, 0, 0)).getTime() : false;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[120px] p-3 rounded-lg border transition-colors relative",
                    date 
                      ? "bg-card hover:bg-muted/50 cursor-pointer" 
                      : "bg-transparent",
                    isCurrentDay && "ring-2 ring-primary bg-primary/5",
                    isPastDay && "bg-muted/30 opacity-60"
                  )}
                  onClick={() => date && !isPastDay && onCreatePost(date)}
                >
                  {isPastDay && (
                    <div className="absolute inset-0 bg-stripes opacity-20 rounded-lg"></div>
                  )}
                  {date && (
                    <>
                      <div className={cn(
                        "text-sm font-medium mb-2 flex items-center justify-between",
                        isCurrentDay && "text-primary"
                      )}>
                        <span>{date.getDate()}</span>
                        {dayPosts.length > 0 && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      
                      {/* Posts for this day */}
                      <div className="space-y-1">
                        {dayPosts.slice(0, 2).map((post, idx) => (
                          <div
                            key={idx}
                            className="text-xs p-1.5 bg-primary/10 rounded text-primary truncate"
                          >
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(post.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="truncate mt-0.5">{post.title}</p>
                          </div>
                        ))}
                        {dayPosts.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayPosts.length - 2} more
                          </div>
                        )}
                        
                        {/* Add post button for today and future dates */}
                        {!isPastDay && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreatePost(date);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Post
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayPosts = getPostsForDate(currentDate);

    return (
      <Card className="border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <p className="text-sm text-muted-foreground">
                {dayPosts.length} posts scheduled
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {hours.map((hour) => {
                const hourPosts = dayPosts.filter(post => 
                  new Date(post.scheduledFor).getHours() === hour
                );
                
                return (
                  <div key={hour} className="flex items-center gap-4 p-2 border-b border-border/50">
                    <div className="w-16 text-sm text-muted-foreground">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1">
                      {hourPosts.length > 0 ? (
                        <div className="space-y-1">
                          {hourPosts.map((post, idx) => (
                            <div key={idx} className="p-2 bg-primary/10 rounded text-primary text-sm">
                              {post.title}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => onCreatePost(new Date(currentDate.setHours(hour)))}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Post
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <Card className="border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day, index) => {
              const dayPosts = getPostsForDate(day);
              const isCurrentDay = isToday(day);
              const isPastDay = day < new Date().setHours(0, 0, 0, 0);
              
              return (
                <div key={index} className="space-y-2">
                  <div className="text-center">
                    <div className={cn(
                      "text-sm font-medium",
                      isCurrentDay && "text-primary"
                    )}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={cn(
                      "text-lg font-bold",
                      isCurrentDay && "text-primary"
                    )}>
                      {day.getDate()}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "min-h-[200px] p-3 border rounded-lg space-y-2",
                    isPastDay && "bg-muted/30 opacity-60",
                    isCurrentDay && "ring-2 ring-primary"
                  )}>
                    {isPastDay && (
                      <div className="absolute inset-0 bg-stripes opacity-20"></div>
                    )}
                    
                    {dayPosts.map((post, idx) => (
                      <div key={idx} className="p-2 bg-primary/10 rounded text-primary text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(post.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="truncate mt-1">{post.title}</p>
                      </div>
                    ))}
                    
                    {!isPastDay && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs opacity-60 hover:opacity-100"
                        onClick={() => onCreatePost(day)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Post
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderListView = () => {
    const sortedPosts = [...posts].sort((a, b) => 
      new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
    );

    return (
      <Card className="border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            {sortedPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <h3 className="font-medium">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.scheduledFor).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {post.status}
                  </Badge>
                </div>
              </div>
            ))}
            {sortedPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts scheduled</p>
                <Button 
                  className="mt-4" 
                  onClick={() => onCreatePost()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Post
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[200px]">
              <h2 className="text-xl font-semibold">{formatDate(currentDate)}</h2>
              <p className="text-sm text-muted-foreground">
                {posts.length} posts scheduled this month
              </p>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDateChange(new Date())}
          >
            Today
          </Button>
        </div>
        
        {/* View Mode Selector */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {CALENDAR_VIEWS.map((view) => (
            <Button
              key={view.id}
              variant={currentView === view.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange(view.id)}
              className={cn(
                "transition-all",
                currentView === view.id && "bg-primary text-primary-foreground"
              )}
            >
              {view.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Calendar Content */}
      {currentView === 'month' && renderMonthView()}
      {currentView === 'day' && renderDayView()}
      {currentView === 'week' && renderWeekView()}
      {currentView === 'list' && renderListView()}
    </div>
  );
}