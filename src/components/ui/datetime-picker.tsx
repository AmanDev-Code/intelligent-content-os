import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { Label } from './label';
import { cn } from '../../lib/utils';
import { getPreferredTimezoneSync, formatInTimezone } from '@/services/timezoneService';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  className?: string;
  label?: string;
  /** Show Clear + Today links (e.g. optional deadlines). */
  clearable?: boolean;
  showQuickActions?: boolean;
  /** Tighter trigger + label (e.g. dense admin forms). */
  compact?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  minDate,
  className,
  label,
  clearable = false,
  showQuickActions = false,
  compact = false,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timezone = getPreferredTimezoneSync();
  
  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    return new Date(dateStr);
  };
  
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return value ? parseDate(value) : new Date();
  });
  const [selectedHour, setSelectedHour] = useState<number>(() => {
    if (value) {
      const date = parseDate(value);
      return date.getHours();
    }
    return 12;
  });
  const [selectedMinute, setSelectedMinute] = useState<number>(() => {
    if (value) {
      const date = parseDate(value);
      return date.getMinutes();
    }
    return 0;
  });

  useEffect(() => {
    if (!value) {
      const now = new Date();
      setSelectedDate(now);
      setSelectedHour(now.getHours());
      setSelectedMinute(now.getMinutes());
      return;
    }
    const date = parseDate(value);
    setSelectedDate(date);
    setSelectedHour(date.getHours());
    setSelectedMinute(date.getMinutes());
  }, [value]);

  const formatDisplayValue = () => {
    if (!value) return 'Select date and time';
    return formatInTimezone(value, timezone, {
      year: 'numeric',
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    newDate.setHours(selectedHour);
    newDate.setMinutes(selectedMinute);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    setSelectedDate(newDate);
    // Return ISO string - backend will receive this and should treat it as user's local time
    onChange(newDate.toISOString());
  };

  const handleTimeChange = (hour: number, minute: number) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(hour);
    newDate.setMinutes(minute);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    setSelectedDate(newDate);
    setSelectedHour(hour);
    setSelectedMinute(minute);
    // Return ISO string - backend will receive this and should treat it as user's local time
    onChange(newDate.toISOString());
  };

  const previousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days: React.ReactElement[] = [];
    const today = new Date();
    const minDateObj = minDate ? new Date(minDate) : null;

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = currentDate.toDateString() === selectedDate.toDateString();
      const isDisabled = Boolean(minDateObj && currentDate < minDateObj);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateSelect(day)}
          disabled={isDisabled}
          className={cn(
            'h-8 w-8 rounded-md text-sm transition-colors',
            isSelected && 'bg-primary text-primary-foreground font-semibold',
            !isSelected && !isDisabled && 'hover:bg-muted',
            isToday && !isSelected && 'border border-primary',
            isDisabled && 'opacity-30 cursor-not-allowed'
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className={cn(compact ? 'space-y-1' : 'space-y-2', className)}>
      {label && (
        <Label
          className={cn(
            'font-medium text-foreground',
            compact ? 'text-xs' : 'text-sm',
          )}
        >
          {label}
        </Label>
      )}

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            compact ? 'h-9 min-h-9 py-0 text-sm' : 'h-11',
            !value && 'text-muted-foreground',
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <CalendarIcon
            className={cn('mr-2 shrink-0', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')}
          />
          <span className="truncate">{formatDisplayValue()}</span>
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div
              className={cn(
                'absolute z-50 mt-1.5 w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden',
                compact ? 'max-w-[min(100%,18rem)]' : 'max-w-sm',
              )}
            >
              {/* Calendar */}
              <div className={cn('border-b border-border', compact ? 'p-2.5' : 'p-4')}>
                <div className={cn('flex items-center justify-between', compact ? 'mb-2' : 'mb-4')}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={previousMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="font-semibold text-sm">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={nextMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
              </div>

              {/* Time Picker */}
              <div className={cn(compact ? 'p-2.5' : 'p-4')}>
                <Label
                  className={cn(
                    'text-xs font-medium text-muted-foreground flex items-center gap-1',
                    compact ? 'mb-2' : 'mb-3',
                  )}
                >
                  <Clock className="h-3 w-3" />
                  Time
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Hour</Label>
                    <select
                      value={selectedHour}
                      onChange={(e) => handleTimeChange(parseInt(e.target.value), selectedMinute)}
                      className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Minute</Label>
                    <select
                      value={selectedMinute}
                      onChange={(e) => handleTimeChange(selectedHour, parseInt(e.target.value))}
                      className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {minutes.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {(clearable || showQuickActions) && (
                <div
                  className={cn(
                    'flex items-center justify-between gap-2 border-t border-border',
                    compact ? 'px-2.5 py-1.5' : 'px-4 py-2',
                  )}
                >
                  {clearable ? (
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() => {
                        onChange('');
                        setIsOpen(false);
                      }}
                    >
                      Clear
                    </button>
                  ) : (
                    <span />
                  )}
                  {showQuickActions ? (
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() => {
                        const now = new Date();
                        now.setSeconds(0, 0);
                        onChange(now.toISOString());
                        setSelectedDate(now);
                        setSelectedHour(now.getHours());
                        setSelectedMinute(now.getMinutes());
                      }}
                    >
                      Today
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              )}

              <div className={cn(compact ? 'p-2.5 pt-0' : 'p-4 pt-0')}>
                <Button
                  type="button"
                  size={compact ? 'sm' : 'default'}
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
