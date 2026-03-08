import { startOfWeek, addDays, format, isSameDay, isBefore, startOfDay } from "date-fns";
import { Plus } from "lucide-react";
import { HOURS_OF_DAY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ScheduledPost } from "@/hooks/useScheduledPosts";

interface WeekViewProps {
  selectedDate: Date;
  posts: ScheduledPost[];
  onAddPost: (date: Date) => void;
}

export function WeekView({ selectedDate, posts, onAddPost }: WeekViewProps) {
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(selectedDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Day headers */}
        <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border">
          <div />
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div key={day.toISOString()} className="text-center py-2 border-l border-border">
                <span className="text-xs text-muted-foreground">{format(day, "EEE")}</span>
                <br />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isToday && "bg-primary text-primary-foreground rounded-full inline-flex items-center justify-center w-6 h-6"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        {HOURS_OF_DAY.filter((_, i) => i % 2 === 0).map((hour) => (
          <div key={hour} className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border min-h-[48px]">
            <div className="flex items-center justify-center text-xs text-muted-foreground border-r border-border">
              {format(new Date(2000, 0, 1, hour), "h a")}
            </div>
            {days.map((day) => {
              const isPast = isBefore(day, today) && !isSameDay(day, today);
              const dayPosts = posts.filter((p) => isSameDay(new Date(p.created_at), day));

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "border-l border-border relative p-0.5",
                    isPast && "bg-muted/20"
                  )}
                >
                  {dayPosts.length > 0 && hour === HOURS_OF_DAY[0] && (
                    <div className="space-y-0.5">
                      {dayPosts.slice(0, 1).map((p) => (
                        <div key={p.id} className="text-[9px] truncate rounded px-1 bg-primary/10 text-primary">
                          {p.title}
                        </div>
                      ))}
                    </div>
                  )}
                  {!isPast && (
                    <button
                      onClick={() => onAddPost(day)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Plus className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
