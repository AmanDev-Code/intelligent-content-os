import { format, isBefore, startOfDay, isSameDay } from "date-fns";
import { Plus } from "lucide-react";
import { HOURS_OF_DAY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ScheduledPost } from "@/hooks/useScheduledPosts";

interface DayViewProps {
  selectedDate: Date;
  posts: ScheduledPost[];
  onAddPost: (date: Date) => void;
}

export function DayView({ selectedDate, posts, onAddPost }: DayViewProps) {
  const today = startOfDay(new Date());
  const isPast = isBefore(selectedDate, today) && !isSameDay(selectedDate, today);
  const isToday = isSameDay(selectedDate, today);

  const dayPosts = posts.filter((p) => isSameDay(new Date(p.created_at), selectedDate));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          {format(selectedDate, "EEEE, MMMM d, yyyy")}
          {isToday && <span className="ml-2 text-xs text-primary font-normal">Today</span>}
        </h3>
        {!isPast && (
          <button
            onClick={() => onAddPost(selectedDate)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Add Post
          </button>
        )}
      </div>

      {isPast && (
        <div className="mb-3 text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
          This date has passed. You cannot schedule posts for past dates.
        </div>
      )}

      {/* Posts for the day */}
      {dayPosts.length > 0 && (
        <div className="mb-4 space-y-2">
          {dayPosts.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-2 rounded-md border border-border bg-card">
              <div className="w-1 h-8 rounded-full bg-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(p.created_at), "h:mm a")} • {p.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hourly timeline */}
      <div className="border border-border rounded-md overflow-hidden">
        {HOURS_OF_DAY.map((hour) => {
          const now = new Date();
          const isCurrentHour = isToday && now.getHours() === hour;

          return (
            <div
              key={hour}
              className={cn(
                "flex items-stretch border-b border-border last:border-b-0 min-h-[40px]",
                isCurrentHour && "bg-primary/5"
              )}
            >
              <div className="w-16 shrink-0 flex items-center justify-center text-xs text-muted-foreground border-r border-border">
                {format(new Date(2000, 0, 1, hour), "h a")}
              </div>
              <div className="flex-1 p-1 relative">
                {!isPast && (
                  <button
                    onClick={() => onAddPost(selectedDate)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
