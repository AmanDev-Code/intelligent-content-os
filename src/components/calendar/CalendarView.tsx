import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CALENDAR_VIEWS } from "@/lib/constants";
import { CalendarDayPostsModal } from "@/components/calendar/CalendarDayPostsModal";

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

interface CalendarViewProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  posts: any[];
  onCreatePost: (date?: Date) => void;
  onRefresh?: () => void;
  /** Drag-drop reschedule: called with the dragged post + the new datetime. */
  onReschedule?: (post: any, newDate: Date) => void;
}

/**
 * Per-status visuals (Postiz-inspired, original implementation). Drives the
 * status dot + chip colors so users can read scheduled/published/failed at a
 * glance across every view.
 */
const STATUS_STYLES: Record<
  string,
  { dot: string; chip: string; label: string }
> = {
  scheduled: {
    dot: 'bg-blue-500',
    chip: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
    label: 'Scheduled',
  },
  processing: {
    dot: 'bg-amber-500',
    chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    label: 'Processing',
  },
  published: {
    dot: 'bg-green-500',
    chip: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30',
    label: 'Published',
  },
  failed: {
    dot: 'bg-red-500',
    chip: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30',
    label: 'Failed',
  },
  cancelled: {
    dot: 'bg-gray-400',
    chip: 'bg-gray-500/10 text-gray-600 dark:text-gray-300 border-gray-500/30',
    label: 'Cancelled',
  },
};

const statusOf = (post: any) =>
  STATUS_STYLES[post?.status as string] || STATUS_STYLES.scheduled;

/**
 * Touch drag-reschedule tuning. Native HTML5 DnD does not fire on touch
 * devices, so for touch/pen pointers we run a parallel pointer-event drag.
 * A small movement threshold distinguishes a tap (open day modal) from a
 * drag (pick up + reschedule), and `touch-action: none` on chips stops the
 * browser from stealing the gesture for scrolling once a drag begins.
 */
const TOUCH_DRAG_THRESHOLD_PX = 8;

/** Hex backgrounds for the floating touch-drag ghost, keyed by status. */
const GHOST_BG: Record<string, string> = {
  scheduled: '#3b82f6',
  processing: '#f59e0b',
  published: '#22c55e',
  failed: '#ef4444',
  cancelled: '#9ca3af',
};

export function CalendarView({
  currentView,
  onViewChange,
  currentDate,
  onDateChange,
  posts,
  onCreatePost,
  onRefresh,
  onReschedule,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayPosts, setSelectedDayPosts] = useState<CalendarPost[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);

  // Drag-drop reschedule state (native HTML5 DnD — no extra deps).
  const [draggingPostId, setDraggingPostId] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  // Touch drag-reschedule: native HTML5 DnD does not fire on touch devices,
  // so a pointer-event fallback (gated to non-mouse pointers) coexists with it.
  const touchDragRef = useRef<{
    cleanup: () => void;
    ghost: HTMLDivElement | null;
  } | null>(null);

  /** Suppress chip click after a completed drag (HTML5 or touch pointer path). */
  const suppressChipClickRef = useRef(false);

  const suppressChipClickBriefly = () => {
    suppressChipClickRef.current = true;
    window.setTimeout(() => {
      suppressChipClickRef.current = false;
    }, 300);
  };

  const dragEnabled = Boolean(onReschedule);

  // Tear down any in-flight touch drag (listeners + floating ghost) on unmount.
  useEffect(
    () => () => {
      const active = touchDragRef.current;
      if (active) {
        active.cleanup();
        if (active.ghost) active.ghost.remove();
      }
    },
    [],
  );

  const formatMonthYear = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const step = direction === 'next' ? 1 : -1;
    if (currentView === 'day') {
      newDate.setDate(currentDate.getDate() + step);
    } else if (currentView === 'week') {
      newDate.setDate(currentDate.getDate() + 7 * step);
    } else {
      newDate.setMonth(currentDate.getMonth() + step);
    }
    onDateChange(newDate);
  };

  const headerLabel = () => {
    if (currentView === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (currentView === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const sameMonth = start.getMonth() === end.getMonth();
      const startLabel = start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const endLabel = end.toLocaleDateString('en-US', {
        month: sameMonth ? undefined : 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return `${startLabel} – ${endLabel}`;
    }
    return formatMonthYear(currentDate);
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

  const transformPostsForModal = (dayPosts: any[]): CalendarPost[] => {
    return dayPosts.map(post => ({
      id: post.id,
      title: post.title || 'Untitled Post',
      start: post.scheduledFor || post.scheduled_for || new Date().toISOString(),
      type: post.status === 'published' ? 'published' : 'scheduled',
      status: post.status || 'scheduled',
      content: {
        id: post.contentId || post.id,
        title: post.title || 'Untitled Post',
        content: post.content || '',
        visual_type: post.type || post.visual_type,
        hashtags: post.hashtags || [],
        visual_url: post.visual_url,
        ai_score: post.ai_score || post.aiScore,
      }
    }));
  };

  const handleDayClick = (date: Date) => {
    const dayPosts = getPostsForDate(date);
    if (dayPosts.length > 0) {
      setSelectedDate(date);
      setSelectedDayPosts(transformPostsForModal(dayPosts));
      setShowDayModal(true);
    } else {
      onCreatePost(date);
    }
  };

  // ---- Drag and drop reschedule ----------------------------------------

  const canDragPost = (post: any) =>
    dragEnabled && post?.status !== 'published' && Boolean(post?.id);

  const findDraggingPost = () => posts.find((p) => p.id === draggingPostId);

  const buildDropDate = (day: Date, hour?: number, sourcePost?: any) => {
    const target = new Date(day);
    const source = sourcePost ?? findDraggingPost();
    const original = source ? new Date(source.scheduledFor) : null;
    if (typeof hour === 'number') {
      target.setHours(hour, original ? original.getMinutes() : 0, 0, 0);
    } else if (original) {
      target.setHours(original.getHours(), original.getMinutes(), 0, 0);
    } else {
      target.setHours(9, 0, 0, 0);
    }
    return target;
  };

  const handleDragStart = (
    e: React.DragEvent,
    post: any,
  ) => {
    if (!canDragPost(post)) {
      e.preventDefault();
      return;
    }
    setDraggingPostId(post.id);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(post.id));
    } catch {
      /* some browsers throw if dataTransfer is locked — safe to ignore */
    }
  };

  const handleDragEnd = () => {
    if (draggingPostId) suppressChipClickBriefly();
    setDraggingPostId(null);
    setDragOverKey(null);
  };

  const allowDrop = (e: React.DragEvent, key: string, droppable: boolean) => {
    if (!draggingPostId || !droppable) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverKey !== key) setDragOverKey(key);
  };

  const handleDrop = (e: React.DragEvent, day: Date, hour?: number) => {
    e.preventDefault();
    const post = findDraggingPost();
    setDragOverKey(null);
    setDraggingPostId(null);
    if (!post || !onReschedule) return;
    const target = buildDropDate(day, hour);
    const current = new Date(post.scheduledFor);
    if (current.getTime() === target.getTime()) return;
    onReschedule(post, target);
  };

  const dragProps = (post: any) =>
    canDragPost(post)
      ? {
          draggable: true,
          onDragStart: (e: React.DragEvent) => handleDragStart(e, post),
          onDragEnd: handleDragEnd,
        }
      : {};

  // ---- Touch drag and drop reschedule (pointer events) ------------------
  // Drop targets advertise their identity via data-* attributes so the touch
  // handler can resolve them with document.elementFromPoint (no per-cell
  // touch listeners needed). Mirrors the HTML5 drop wiring exactly.
  const dropAttrs = (
    key: string,
    droppable: boolean,
    day: Date | null,
    hour?: number,
  ): Record<string, string> => {
    const attrs: Record<string, string> = {
      'data-drop-key': key,
      'data-droppable': String(Boolean(droppable && day)),
    };
    if (day) attrs['data-drop-day'] = day.toISOString();
    if (typeof hour === 'number') attrs['data-drop-hour'] = String(hour);
    return attrs;
  };

  const removeTouchGhost = () => {
    if (touchDragRef.current?.ghost) {
      touchDragRef.current.ghost.remove();
      touchDragRef.current.ghost = null;
    }
  };

  const resolveDropTarget = (x: number, y: number): HTMLElement | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const cell = el?.closest('[data-drop-key]') as HTMLElement | null;
    if (!cell || cell.dataset.droppable !== 'true') return null;
    return cell;
  };

  const handleChipPointerDown = (e: React.PointerEvent, post: any) => {
    // Desktop mouse keeps using native HTML5 DnD; only touch/pen fall back here.
    if (e.pointerType === 'mouse') return;
    if (!canDragPost(post)) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let dragging = false;
    let lastKey: string | null = null;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      if (!dragging) {
        if (Math.hypot(dx, dy) < TOUCH_DRAG_THRESHOLD_PX) return;
        // Threshold crossed → pick the post up.
        dragging = true;
        setDraggingPostId(post.id);
        try {
          navigator.vibrate?.(12);
        } catch {
          /* vibrate unsupported — non-fatal */
        }
        const ghost = document.createElement('div');
        ghost.textContent = post.title || 'Scheduled post';
        Object.assign(ghost.style, {
          position: 'fixed',
          left: '0px',
          top: '0px',
          zIndex: '9999',
          pointerEvents: 'none',
          transform: 'translate(-50%, -160%)',
          padding: '5px 10px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '600',
          maxWidth: '220px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: '#fff',
          background: GHOST_BG[post?.status as string] || GHOST_BG.scheduled,
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          opacity: '0.95',
        } as CSSStyleDeclaration);
        document.body.appendChild(ghost);
        if (touchDragRef.current) touchDragRef.current.ghost = ghost;
      }

      // Once dragging, stop the page/list from scrolling under the finger.
      ev.preventDefault();
      const ghost = touchDragRef.current?.ghost;
      if (ghost) {
        ghost.style.left = `${ev.clientX}px`;
        ghost.style.top = `${ev.clientY}px`;
      }

      const cell = resolveDropTarget(ev.clientX, ev.clientY);
      const key = cell?.dataset.dropKey ?? null;
      if (key !== lastKey) {
        lastKey = key;
        setDragOverKey(key);
      }
    };

    const finish = (ev: PointerEvent, dropped: boolean) => {
      removeTouchGhost();
      cleanup();
      if (!dragging) return; // a tap → leave click/tap-to-open behavior intact
      suppressChipClickBriefly();
      setDraggingPostId(null);
      setDragOverKey(null);
      if (!dropped || !onReschedule) return;

      const cell = resolveDropTarget(ev.clientX, ev.clientY);
      if (!cell) return;
      const dayIso = cell.dataset.dropDay;
      if (!dayIso) return;
      const hourStr = cell.dataset.dropHour;
      const hour =
        hourStr !== undefined && hourStr !== '' ? Number(hourStr) : undefined;
      const target = buildDropDate(new Date(dayIso), hour, post);
      const current = new Date(post.scheduledFor);
      if (current.getTime() === target.getTime()) return;
      onReschedule(post, target);
    };

    const onPointerUp = (ev: PointerEvent) => finish(ev, true);
    const onPointerCancel = (ev: PointerEvent) => finish(ev, false);

    const cleanup = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerCancel);
      touchDragRef.current = null;
    };

    touchDragRef.current = { cleanup, ghost: null };
    document.addEventListener('pointermove', move, { passive: false });
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerCancel);
  };

  const touchDragProps = (post: any) =>
    canDragPost(post)
      ? {
          onPointerDown: (e: React.PointerEvent) =>
            handleChipPointerDown(e, post),
          style: { touchAction: 'none' as const },
        }
      : {};

  // ---- Reusable post chip ----------------------------------------------

  const PostChip = ({
    post,
    showTime,
    dayDate,
  }: {
    post: any;
    showTime?: boolean;
    /** Calendar cell date; falls back to post.scheduledFor when omitted. */
    dayDate?: Date | null;
  }) => {
    const style = statusOf(post);
    const draggable = canDragPost(post);

    const handleChipClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (suppressChipClickRef.current) return;
      const date = dayDate ?? new Date(post.scheduledFor);
      handleDayClick(date);
    };

    return (
      <div
        {...dragProps(post)}
        {...touchDragProps(post)}
        onClick={handleChipClick}
        className={cn(
          'group/chip text-xs px-1.5 py-1 rounded border flex items-center gap-1 truncate transition-all select-none',
          style.chip,
          draggable && 'cursor-grab active:cursor-grabbing hover:shadow-sm',
          draggingPostId === post.id && 'opacity-40',
        )}
        title={`${style.label}${post.title ? ` · ${post.title}` : ''}`}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />
        {showTime && (
          <span className="shrink-0 tabular-nums opacity-80">
            {new Date(post.scheduledFor).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
        <span className="truncate">{post.title}</span>
        {draggable && (
          <GripVertical className="h-3 w-3 ml-auto shrink-0 opacity-0 group-hover/chip:opacity-50 hidden md:block" />
        )}
      </div>
    );
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
              const cellKey = `month-${index}`;
              const droppable = Boolean(date) && !isPastDay;
              const isDragOver = dragOverKey === cellKey;

              return (
                <div
                  key={index}
                  {...dropAttrs(cellKey, droppable, date)}
                  className={cn(
                    "min-h-[48px] sm:min-h-[80px] md:min-h-[120px] p-1 sm:p-2 md:p-3 rounded-md sm:rounded-lg border transition-colors relative overflow-hidden",
                    date ? "bg-card cursor-pointer" : "bg-transparent border-transparent",
                    isCurrentDay && "ring-2 ring-primary bg-primary/5",
                    isPastDay && "bg-muted/30 opacity-60",
                    isDragOver && "ring-2 ring-primary bg-primary/10 opacity-100"
                  )}
                  onClick={() => date && handleDayClick(date)}
                  onDragOver={(e) => date && allowDrop(e, cellKey, droppable)}
                  onDragLeave={() => isDragOver && setDragOverKey(null)}
                  onDrop={(e) => date && droppable && handleDrop(e, date)}
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
                      <div className="space-y-0.5 sm:space-y-1 mt-0.5 sm:mt-1 relative z-10">
                        {dayPosts.slice(0, 2).map((post) => (
                          <PostChip key={post.id} post={post} dayDate={date} />
                        ))}
                        {dayPosts.length > 2 && (
                          <div className="text-[10px] sm:text-xs text-muted-foreground">+{dayPosts.length - 2} more</div>
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
                const slotDate = new Date(currentDate);
                slotDate.setHours(hour, 0, 0, 0);
                const droppable = slotDate.getTime() > Date.now() - 60 * 60 * 1000;
                const cellKey = `day-${hour}`;
                const isDragOver = dragOverKey === cellKey;
                return (
                  <div
                    key={hour}
                    {...dropAttrs(cellKey, droppable, currentDate, hour)}
                    className={cn(
                      "flex items-center gap-2 sm:gap-4 p-2 border-b border-border/50 rounded transition-colors",
                      isDragOver && "ring-2 ring-primary bg-primary/10"
                    )}
                    onDragOver={(e) => allowDrop(e, cellKey, droppable)}
                    onDragLeave={() => isDragOver && setDragOverKey(null)}
                    onDrop={(e) => droppable && handleDrop(e, currentDate, hour)}
                  >
                    <div className="w-12 sm:w-16 text-xs sm:text-sm text-muted-foreground shrink-0">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 min-w-0">
                      {hourPosts.length > 0 ? (
                        <div className="space-y-1">
                          {hourPosts.map((post) => (
                            <PostChip key={post.id} post={post} showTime dayDate={currentDate} />
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
          {/* Desktop: 7-column grid */}
          <div className="hidden md:grid grid-cols-7 gap-2 lg:gap-4">
            {weekDays.map((day, index) => {
              const dayPosts = getPostsForDate(day);
              const isCurrentDay = isToday(day);
              const isPastDay = isPast(day);
              const cellKey = `week-${index}`;
              const droppable = !isPastDay;
              const isDragOver = dragOverKey === cellKey;
              return (
                <div key={index} className="space-y-2">
                  <div className="text-center">
                    <div className={cn("text-sm font-medium", isCurrentDay && "text-primary")}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={cn("text-lg font-bold", isCurrentDay && "text-primary")}>{day.getDate()}</div>
                  </div>
                  <div
                    {...dropAttrs(cellKey, droppable, day)}
                    className={cn(
                      "min-h-[200px] p-3 border rounded-lg space-y-2 relative transition-colors cursor-pointer",
                      isPastDay && "bg-muted/30 opacity-60",
                      isCurrentDay && "ring-2 ring-primary",
                      isDragOver && "ring-2 ring-primary bg-primary/10 opacity-100"
                    )}
                    onClick={() => handleDayClick(day)}
                    onDragOver={(e) => allowDrop(e, cellKey, droppable)}
                    onDragLeave={() => isDragOver && setDragOverKey(null)}
                    onDrop={(e) => droppable && handleDrop(e, day)}
                  >
                    {isPastDay && <div className="absolute inset-0 bg-stripes opacity-20 rounded-lg" />}
                    <div className="relative z-10 space-y-2">
                      {dayPosts.map((post) => (
                        <PostChip key={post.id} post={post} showTime dayDate={day} />
                      ))}
                    </div>
                    {!isPastDay && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs opacity-60 hover:opacity-100 relative z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreatePost(day);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Post
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Mobile: vertical list */}
          <div className="md:hidden space-y-3">
            {weekDays.map((day, index) => {
              const dayPosts = getPostsForDate(day);
              const isCurrentDay = isToday(day);
              const isPastDay = isPast(day);
              const cellKey = `week-m-${index}`;
              const droppable = !isPastDay;
              const isDragOver = dragOverKey === cellKey;
              return (
                <div
                  key={index}
                  {...dropAttrs(cellKey, droppable, day)}
                  className={cn(
                    "p-3 border rounded-lg relative transition-colors cursor-pointer",
                    isPastDay && "bg-muted/30 opacity-60",
                    isCurrentDay && "ring-2 ring-primary",
                    isDragOver && "ring-2 ring-primary bg-primary/10 opacity-100"
                  )}
                  onClick={() => handleDayClick(day)}
                  onDragOver={(e) => allowDrop(e, cellKey, droppable)}
                  onDragLeave={() => isDragOver && setDragOverKey(null)}
                  onDrop={(e) => droppable && handleDrop(e, day)}
                >
                  {isPastDay && <div className="absolute inset-0 bg-stripes opacity-20 rounded-lg" />}
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <div className={cn("font-medium text-sm", isCurrentDay && "text-primary")}>
                      {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    {!isPastDay && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreatePost(day);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    )}
                  </div>
                  {dayPosts.length > 0 && (
                    <div className="space-y-1 relative z-10">
                      {dayPosts.map((post) => (
                        <PostChip key={post.id} post={post} showTime dayDate={day} />
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
            {sortedPosts.map((post) => {
              const style = statusOf(post);
              return (
                <div key={post.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={cn('w-2 h-2 rounded-full shrink-0', style.dot)} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base truncate">{post.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{new Date(post.scheduledFor).toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize self-start sm:self-center shrink-0">{style.label}</Badge>
                </div>
              );
            })}
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
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[140px] sm:min-w-[200px]">
              <h2 className="text-base sm:text-xl font-semibold">{headerLabel()}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{posts.length} posts</p>
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigate('next')}>
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

      {/* Drag hint + status legend */}
      {dragEnabled && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground px-1">
          <span className="hidden md:inline">Drag a scheduled post to a new slot to reschedule.</span>
          <span className="md:hidden">Drag a scheduled post to a new day or time to reschedule.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Scheduled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Published
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Failed
          </span>
        </div>
      )}

      {currentView === 'month' && renderMonthView()}
      {currentView === 'day' && renderDayView()}
      {currentView === 'week' && renderWeekView()}
      {currentView === 'list' && renderListView()}

      {/* Day Posts Modal */}
      <CalendarDayPostsModal
        open={showDayModal}
        onOpenChange={setShowDayModal}
        date={selectedDate}
        posts={selectedDayPosts}
        onRefresh={onRefresh}
      />
    </div>
  );
}
