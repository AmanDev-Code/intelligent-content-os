"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, getDaysInMonth, getDay, startOfMonth } from "date-fns";
import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MaintenanceConfig {
  enabled: boolean;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  message?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

// ── Compact date-time picker ──────────────────────────────────────────────────

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

interface DateTimePickerProps {
  label: string;
  value: Date | null;
  onChange: (d: Date) => void;
}

function DateTimePicker({ label, value, onChange }: DateTimePickerProps) {
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? now.getMonth());

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    }
  }, [value]);

  const selectedHour = value?.getHours() ?? 0;
  const selectedMinute = value?.getMinutes() ?? 0;

  const daysInMonth = getDaysInMonth(new Date(viewYear, viewMonth));
  // getDay returns 0=Sun…6=Sat
  const firstWeekday = getDay(startOfMonth(new Date(viewYear, viewMonth)));

  // Build a flat array of [null (padding), ...day numbers]
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad tail to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function handleDayClick(day: number) {
    const base = value ?? new Date();
    const d = new Date(viewYear, viewMonth, day, base.getHours(), base.getMinutes(), 0, 0);
    onChange(d);
  }

  function handleHourChange(h: number) {
    const base = value ?? new Date(viewYear, viewMonth, 1);
    const d = new Date(base);
    d.setHours(h);
    onChange(d);
  }

  function handleMinuteChange(m: number) {
    const base = value ?? new Date(viewYear, viewMonth, 1);
    const d = new Date(base);
    d.setMinutes(m);
    onChange(d);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const displayValue = value
    ? format(value, "MMM d, yyyy 'at' HH:mm")
    : "Select date & time…";

  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-left hover:bg-muted/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className={value ? "text-foreground" : "text-muted-foreground"}>
              {displayValue}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 w-auto"
          align="start"
          sideOffset={4}
        >
          <div className="p-3 space-y-3 w-[252px]">
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-semibold">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Day-of-week labels */}
            <div className="grid grid-cols-7 gap-px">
              {DAY_LABELS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-medium text-muted-foreground py-0.5"
                >
                  {d}
                </div>
              ))}
              {/* Day cells */}
              {cells.map((day, idx) => {
                if (day === null) {
                  return <div key={`e-${idx}`} />;
                }
                const isSelected =
                  value &&
                  value.getFullYear() === viewYear &&
                  value.getMonth() === viewMonth &&
                  value.getDate() === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={`text-center text-xs py-1 rounded transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "hover:bg-muted"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <Separator />

            {/* Time selectors */}
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="flex items-center gap-1 flex-1">
                <select
                  value={selectedHour}
                  onChange={(e) => handleHourChange(Number(e.target.value))}
                  className="flex-1 rounded border border-input bg-background px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="text-muted-foreground text-xs font-medium">:</span>
                <select
                  value={selectedMinute}
                  onChange={(e) => handleMinuteChange(Number(e.target.value))}
                  className="flex-1 rounded border border-input bg-background px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {Array.from({ length: 60 }, (_, m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function MaintenanceControl() {
  const [config, setConfig] = useState<MaintenanceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [savingMsg, setSavingMsg] = useState(false);
  const [savingSched, setSavingSched] = useState(false);
  const [clearingSched, setClearingSched] = useState(false);

  // Form state — only controlled when user actively edits
  const [messageInput, setMessageInput] = useState("");
  const [schedStart, setSchedStart] = useState<Date | null>(null);
  const [schedEnd, setSchedEnd] = useState<Date | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      const data = (await apiClient.get("/admin/maintenance")) as MaintenanceConfig;
      setConfig(data);
      setMessageInput(data.message ?? "");
      if (data.scheduledStart) setSchedStart(new Date(data.scheduledStart));
      if (data.scheduledEnd) setSchedEnd(new Date(data.scheduledEnd));
    } catch {
      toast.error("Failed to load maintenance config");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadConfig(); }, [loadConfig]);

  // ── Is maintenance currently active? (mirrors backend logic) ───────────────
  const isActive = useMemo(() => {
    if (!config) return false;
    if (config.enabled) return true;
    if (config.scheduledStart && config.scheduledEnd) {
      const now = new Date();
      return now >= new Date(config.scheduledStart) && now <= new Date(config.scheduledEnd);
    }
    return false;
  }, [config]);

  const hasSchedule = Boolean(config?.scheduledStart || config?.scheduledEnd);

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleToggleEnabled(enabled: boolean) {
    setToggling(true);
    try {
      const updated = (await apiClient.post("/admin/maintenance", { enabled })) as MaintenanceConfig;
      setConfig(updated);
      toast.success(enabled ? "Maintenance mode enabled" : "Maintenance mode disabled");
    } catch {
      toast.error("Failed to update maintenance mode");
    } finally {
      setToggling(false);
    }
  }

  async function handleSaveMessage() {
    setSavingMsg(true);
    try {
      const updated = (await apiClient.post("/admin/maintenance", {
        message: messageInput.trim() || null,
      })) as MaintenanceConfig;
      setConfig(updated);
      toast.success("Message saved");
    } catch {
      toast.error("Failed to save message");
    } finally {
      setSavingMsg(false);
    }
  }

  async function handleSetSchedule() {
    if (!schedStart || !schedEnd) {
      toast.error("Please select both start and end times");
      return;
    }
    if (schedEnd <= schedStart) {
      toast.error("End time must be after start time");
      return;
    }
    setSavingSched(true);
    try {
      const updated = (await apiClient.post("/admin/maintenance", {
        scheduledStart: schedStart.toISOString(),
        scheduledEnd: schedEnd.toISOString(),
      })) as MaintenanceConfig;
      setConfig(updated);
      toast.success("Schedule saved");
    } catch {
      toast.error("Failed to save schedule");
    } finally {
      setSavingSched(false);
    }
  }

  async function handleClearSchedule() {
    setClearingSched(true);
    try {
      const updated = (await apiClient.delete("/admin/maintenance/schedule")) as MaintenanceConfig;
      setConfig(updated);
      setSchedStart(null);
      setSchedEnd(null);
      toast.success("Schedule cleared");
    } catch {
      toast.error("Failed to clear schedule");
    } finally {
      setClearingSched(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* ── Status card ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Maintenance Status
            </CardTitle>
            <Badge
              variant={isActive ? "destructive" : "secondary"}
              className="text-xs font-semibold"
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Maintenance mode</p>
              <p className="text-xs text-muted-foreground">
                Immediately shows the maintenance page to all visitors
              </p>
            </div>
            <Switch
              checked={config?.enabled ?? false}
              onCheckedChange={handleToggleEnabled}
              disabled={toggling}
              aria-label="Toggle maintenance mode"
            />
          </div>

          {/* Scheduled window info */}
          {hasSchedule && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
              <p className="font-medium text-amber-600 dark:text-amber-400 mb-0.5">
                Scheduled window
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {config?.scheduledStart
                  ? format(new Date(config.scheduledStart), "MMM d, yyyy 'at' HH:mm")
                  : "—"}{" "}
                →{" "}
                {config?.scheduledEnd
                  ? format(new Date(config.scheduledEnd), "MMM d, yyyy 'at' HH:mm")
                  : "—"}
              </p>
            </div>
          )}

          {config?.updatedAt && (
            <p className="text-xs text-muted-foreground">
              Last updated:{" "}
              {format(new Date(config.updatedAt), "MMM d, yyyy 'at' HH:mm")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Custom message ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Maintenance Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Optional message shown on the maintenance page. Leave blank to hide it.
          </p>
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="e.g. We're upgrading our infrastructure. Back in ~2 hours."
              className="flex-1 text-sm"
            />
            {messageInput !== (config?.message ?? "") && (
              <Button
                size="sm"
                variant="ghost"
                className="h-9 px-2 text-muted-foreground"
                onClick={() => setMessageInput(config?.message ?? "")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleSaveMessage}
            disabled={savingMsg}
            className="w-full sm:w-auto"
          >
            {savingMsg ? (
              <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
            ) : "Save message"}
          </Button>
        </CardContent>
      </Card>

      {/* ── Schedule ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Schedule Maintenance Window
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Maintenance will auto-activate when the current time enters the window and
            deactivate when it ends — no manual action required.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <DateTimePicker
              label="Start"
              value={schedStart}
              onChange={setSchedStart}
            />
            <DateTimePicker
              label="End"
              value={schedEnd}
              onChange={setSchedEnd}
            />
          </div>

          {schedStart && schedEnd && (
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">Preview: </span>
              {format(schedStart, "MMM d, HH:mm")} → {format(schedEnd, "MMM d, HH:mm")}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={handleSetSchedule}
              disabled={savingSched || !schedStart || !schedEnd}
            >
              {savingSched ? (
                <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
              ) : "Set schedule"}
            </Button>
            {hasSchedule && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearSchedule}
                disabled={clearingSched}
                className="text-destructive border-destructive/30 hover:bg-destructive/5"
              >
                {clearingSched ? (
                  <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Clearing…</>
                ) : (
                  <><Trash2 className="h-3.5 w-3.5 mr-1.5" />Clear schedule</>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Danger zone ── */}
      <Card className="border-destructive/25">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {config?.enabled ? "Disable maintenance now" : "Enable maintenance now"}
              </p>
              <p className="text-xs text-muted-foreground">
                {config?.enabled
                  ? "Immediately restore access for all visitors"
                  : "Immediately block all visitors with the maintenance page"}
              </p>
            </div>
            <Button
              size="sm"
              variant={config?.enabled ? "outline" : "destructive"}
              onClick={() => handleToggleEnabled(!config?.enabled)}
              disabled={toggling}
              className={
                config?.enabled
                  ? "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                  : ""
              }
            >
              {toggling
                ? "Updating…"
                : config?.enabled
                ? "Disable now"
                : "Enable now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
