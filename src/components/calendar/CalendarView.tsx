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
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));
    return days;
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === new Date().toDateString();
  };

  const isPast = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() < today.getTime();
  };

  const getPostsForDate = (date: Date | null) => {
    if (!date) return [];
    return posts.filter(post => new Date(post.scheduledFor).toDateString() === date.toDateString());
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const shortWeekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <Card className="border-0">
        <CardContent className="p-2 sm:p-3 md:p-4">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4 mb-2 md:mb-4">
            {weekDays.map((day, i) => (
              <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-1 md:py-2">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{shortWeekDays[i]}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((date, index) => {
              const dayPosts = getPostsForDate(date);
              const isCurrentDay = isToday(date);
              const isPastDay = isPast(date);

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[48px] sm:min-h-[80px] md:min-h-[120px] p-1 sm:p-2 md:p-3 rounded-md sm:rounded-lg border transition-colors relative overflow-hidden",
                    date ? "bg-card cursor-pointer" : "bg-transparent border-transparent",
                    isCurrentDay && "ring-2 ring-primary bg-primary/5",
                    isPastDay && "bg-muted/30 opacity-60"
                  )}
                  onClick={() => date && !isPastDay && onCreatePost(date)}
                >
                  {isPastDay && date && (
                    <div className="absolute inset-0 bg-stripes opacity-20 rounded-md sm:rounded-lg" />
                  )}
                  {date && (
                    <>
                      <div className={cn(
                        "text-xs sm:text-sm font-medium flex items-center justify-between",
                        isCurrentDay && "text-primary"
                      )}>
                        <span>{date.getDate()}</span>
                        {dayPosts.length > 0 && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full" />}
                      </div>
                      <div className="hidden sm:block space-y-1 mt-1">
                        {dayPosts.slice(0, 2).map((post, idx) => (
                          <div key={idx} className="text-xs p-1 md:p-1.5 bg-primary/10 rounded text-primary truncate">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 hidden md:block" />
                              <span className="truncate">{post.title}</span>
                            </div>
                          </div>
                        ))}
                        {dayPosts.length > 2 && (
                          <div className="text-xs text-muted-foreground">+{dayPosts.length - 2} more</div>
                        )}
                      </div>
                      {/* Mobile post count */}
                      {dayPosts.length > 0 && (
                        <div className="sm:hidden text-[10px] text-primary mt-0.5">{dayPosts.length}</div>
                      )}
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
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <p className="text-sm text-muted-foreground">{dayPosts.length} posts scheduled</p>
            </div>
            <div className="grid grid-cols-1 gap-1 sm:gap-2 max-h-[60vh] overflow-y-auto">
              {hours.map((hour) => {
                const hourPosts = dayPosts.filter(post => new Date(post.scheduledFor).getHours() === hour);
                return (
                  <div key={hour} className="flex items-center gap-2 sm:gap-4 p-2 border-b border-border/50">
                    <div className="w-12 sm:w-16 text-xs sm:text-sm text-muted-foreground shrink-0">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1">
                      {hourPosts.length > 0 ? (
                        <div className="space-y-1">
                          {hourPosts.map((post, idx) => (
                            <div key={idx} className="p-2 bg-primary/10 rounded text-primary text-sm truncate">{post.title}</div>
                          ))}
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-muted-foreground text-xs h-7" onClick={() => onCreatePost(new Date(new Date(currentDate).setHours(hour)))}>
                          <Plus className="h-3 w-3 mr-1" /> Add
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
        <CardContent className="p-2 sm:p-6">
          {/* Mobile: vertical list; Desktop: 7-column grid */}
          <div className="hidden md:grid grid-cols-7 gap-2 lg:gap-4">
            {weekDays.map((day, index) => {
              const dayPosts = getPostsForDate(day);
              const isCurrentDay = isToday(day);
              const isPastDay = isPast(day);
              return (
                <div key={index} className="space-y-2">
                  <div className="text-center">
                    <div className={cn("text-sm font-medium", isCurrentDay && "text-primary")}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={cn("text-lg font-bold", isCurrentDay && "text-primary")}>{day.getDate()}</div>
                  </div>
                  <div className={cn(
                    "min-h-[200px] p-3 border rounded-lg space-y-2 relative",
                    isPastDay && "bg-muted/30 opacity-60",
                    isCurrentDay && "ring-2 ring-primary"
                  )}>
                    {isPastDay && <div className="absolute inset-0 bg-stripes opacity-20 rounded-lg" />}
                    {dayPosts.map((post, idx) => (
                      <div key={idx} className="p-2 bg-primary/10 rounded text-primary text-xs relative z-10">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(post.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="truncate mt-1">{post.title}</p>
                      </div>
                    ))}
                    {!isPastDay && (
                      <Button variant="ghost" size="sm" className="w-full text-xs opacity-60 hover:opacity-100 relative z-10" onClick={() => onCreatePost(day)}>
                        <Plus className="h-3 w-3 mr-1" /> Add Post
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Mobile: vertical */}
          <div className="md:hidden space-y-3">
            {weekDays.map((day, index) => {
              const dayPosts = getPostsForDate(day);
              const isCurrentDay = isToday(day);
              const isPastDay = isPast(day);
              return (
                <div key={index} className={cn(
                  "p-3 border rounded-lg relative",
                  isPastDay && "bg-muted/30 opacity-60",
                  isCurrentDay && "ring-2 ring-primary"
                )}>
                  {isPastDay && <div className="absolute inset-0 bg-stripes opacity-20 rounded-lg" />}
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <div className={cn("font-medium text-sm", isCurrentDay && "text-primary")}>
                      {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    {!isPastDay && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onCreatePost(day)}>
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    )}
                  </div>
                  {dayPosts.length > 0 && (
                    <div className="space-y-1 relative z-10">
                      {dayPosts.map((post, idx) => (
                        <div key={idx} className="p-2 bg-primary/10 rounded text-primary text-xs truncate">{post.title}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderListView = () => {
    const sortedPosts = [...posts].sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
    return (
      <Card className="border-0">
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {sortedPosts.map((post) => (
              <div key={post.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm sm:text-base truncate">{post.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{new Date(post.scheduledFor).toLocaleString()}</p>
                </div>
                <Badge variant="outline" className="capitalize self-start sm:self-center shrink-0">{post.status}</Badge>
              </div>
            ))}
            {sortedPosts.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <p className="text-muted-foreground">No posts scheduled</p>
                <Button className="mt-4" onClick={() => onCreatePost()}>
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Post
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[140px] sm:min-w-[200px]">
              <h2 className="text-base sm:text-xl font-semibold">{formatDate(currentDate)}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{posts.length} posts</p>
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8" onClick={() => onDateChange(new Date())}>Today</Button>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
          {CALENDAR_VIEWS.map((view) => (
            <Button
              key={view.id}
              variant={currentView === view.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange(view.id)}
              className={cn(
                "transition-all text-xs sm:text-sm flex-1 sm:flex-none",
                currentView === view.id && "bg-primary text-primary-foreground"
              )}
            >
              {view.label}
            </Button>
          ))}
        </div>
      </div>

      {currentView === 'month' && renderMonthView()}
      {currentView === 'day' && renderDayView()}
      {currentView === 'week' && renderWeekView()}
      {currentView === 'list' && renderListView()}
    </div>
  );
}
