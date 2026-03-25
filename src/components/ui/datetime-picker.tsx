import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { Label } from './label';
import { cn } from '../../lib/utils';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  className?: string;
  label?: string;
}

export function DateTimePicker({ value, onChange, minDate, className, label }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Helper to convert IST string to Date
  const parseISTDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    // Parse the ISO string and treat it as IST
    const date = new Date(dateStr);
    return date;
  };
  
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return value ? parseISTDate(value) : new Date();
  });
  const [selectedHour, setSelectedHour] = useState<number>(() => {
    if (value) {
      const date = parseISTDate(value);
      return date.getHours();
    }
    return 12;
  });
  const [selectedMinute, setSelectedMinute] = useState<number>(() => {
    if (value) {
      const date = parseISTDate(value);
      return date.getMinutes();
    }
    return 0;
  });

  const formatDisplayValue = () => {
    if (!value) return 'Select date and time';
    const date = new Date(value);
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
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
    <div className={cn('space-y-2', className)}>
      {label && <Label className="text-sm font-medium text-foreground">{label}</Label>}
      
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-11',
            !value && 'text-muted-foreground'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{formatDisplayValue()}</span>
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-50 mt-2 w-full max-w-sm rounded-lg border border-border bg-card shadow-lg overflow-hidden">
              {/* Calendar */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
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
              <div className="p-4">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-3">
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

              <div className="p-4 pt-0">
                <Button
                  type="button"
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
