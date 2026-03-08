import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ScheduledPost } from "@/hooks/useScheduledPosts";

interface CalendarGridProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  posts: ScheduledPost[];
  onAddPost: (date: Date) => void;
  onSelectDay: (date: Date) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({ currentDate, onDateChange, posts, onAddPost, onSelectDay }: CalendarGridProps) {
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getPostsForDay = (day: Date) =>
    posts.filter((p) => isSameDay(new Date(p.created_at), day));

  const isPast = (day: Date) => isBefore(day, today) && !isSameDay(day, today);

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          {format(currentDate, "MMMM yyyy")}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onDateChange(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onDateChange(new Date())}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onDateChange(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 border-t border-l border-border">
        {days.map((day) => {
          const dayPosts = getPostsForDay(day);
          const past = isPast(day);
          const isToday = isSameDay(day, today);
          const inMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "relative min-h-[80px] border-r border-b border-border p-1.5 cursor-pointer transition-colors",
                !inMonth && "opacity-40",
                isToday && "bg-primary/5",
                past && "bg-muted/30"
              )}
              onClick={() => onSelectDay(day)}
            >
              {past && <div className="absolute inset-0 past-date-overlay pointer-events-none" />}

              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-medium",
                    isToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center",
                    !isToday && "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                {!past && inMonth && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPost(day);
                    }}
                    className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    aria-label={`Add post on ${format(day, "MMM d")}`}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Post indicators */}
              <div className="mt-1 space-y-0.5">
                {dayPosts.slice(0, 2).map((p) => (
                  <div
                    key={p.id}
                    className="text-[10px] leading-tight truncate rounded px-1 py-0.5 bg-primary/10 text-primary"
                  >
                    {p.title}
                  </div>
                ))}
                {dayPosts.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{dayPosts.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
