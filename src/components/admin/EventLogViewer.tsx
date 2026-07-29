"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  Search,
  Terminal,
} from "lucide-react";
import {
  useMediaEngineEvents,
  type MediaEngineEvent,
  type SeverityFilter,
} from "@/hooks/useMediaEngineEvents";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function severityClass(severity: MediaEngineEvent["severity"]): string {
  switch (severity) {
    case "info":
      return "text-sky-600 dark:text-sky-400";
    case "warning":
      return "text-amber-600 dark:text-amber-400";
    case "critical":
      return "text-destructive";
  }
}

function severityPrefix(severity: MediaEngineEvent["severity"]): string {
  switch (severity) {
    case "info":
      return "INFO";
    case "warning":
      return "WARN";
    case "critical":
      return "CRIT";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EventLogViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [engineFilter, setEngineFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);

  const { events, loading, error } = useMediaEngineEvents({
    autoRefreshMs: isOpen ? 10000 : 0,
    limit: 200,
    severity: severity,
  });

  const scrollEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Derive unique accounts & engines from events for filter dropdowns
  const { accounts, engines } = useMemo(() => {
    const accts = new Set<string>();
    const engs = new Set<string>();
    for (const ev of events) {
      if (ev.accountId) accts.add(ev.accountId);
      if (ev.engine) engs.add(ev.engine);
    }
    return {
      accounts: Array.from(accts).sort(),
      engines: Array.from(engs).sort(),
    };
  }, [events]);

  // Apply client-side filters (account, engine, search)
  const filteredEvents = useMemo(() => {
    let result = events;

    if (accountFilter !== "all") {
      result = result.filter((ev) => ev.accountId === accountFilter);
    }
    if (engineFilter !== "all") {
      result = result.filter((ev) => ev.engine === engineFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ev) =>
          ev.event.toLowerCase().includes(q) ||
          ev.correlationId.toLowerCase().includes(q) ||
          (ev.accountId && ev.accountId.toLowerCase().includes(q)) ||
          (ev.engine && ev.engine.toLowerCase().includes(q)) ||
          (ev.details &&
            JSON.stringify(ev.details).toLowerCase().includes(q))
      );
    }

    return result;
  }, [events, accountFilter, engineFilter, searchQuery]);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredEvents, autoScroll]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border bg-card">
        {/* Header / Trigger */}
        <CollapsibleTrigger asChild>
          <button
            className="flex w-full items-center justify-between p-4 sm:p-6 hover:bg-accent/50 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Toggle event log viewer"
          >
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <h3 className="text-base font-semibold">Event Log</h3>
                <p className="text-xs text-muted-foreground">
                  Full system event stream with filtering
                </p>
              </div>
              {!isOpen && events.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {events.length} events
                </Badge>
              )}
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        {/* Expandable Content */}
        <CollapsibleContent>
          <div className="border-t px-4 sm:px-6 py-4 space-y-3">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Severity */}
              <Select
                value={severity}
                onValueChange={(v) => setSeverity(v as SeverityFilter)}
              >
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              {/* Account Filter */}
              <Select
                value={accountFilter}
                onValueChange={setAccountFilter}
              >
                <SelectTrigger className="w-[150px] h-8 text-xs">
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a.length > 16 ? a.slice(0, 16) + "…" : a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Engine Filter */}
              <Select
                value={engineFilter}
                onValueChange={setEngineFilter}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Engines</SelectItem>
                  {engines.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs"
                  aria-label="Search event log"
                />
              </div>

              {/* Auto-scroll toggle */}
              <Button
                variant={autoScroll ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => setAutoScroll(!autoScroll)}
                aria-label={autoScroll ? "Pause auto-scroll" : "Resume auto-scroll"}
              >
                {autoScroll ? (
                  <>
                    <Pause className="h-3 w-3" />
                    Live
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    Paused
                  </>
                )}
              </Button>
            </div>

            {/* Terminal Log Area */}
            <div className="relative rounded-md border bg-zinc-950 dark:bg-zinc-950">
              {/* Top bar */}
              <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  media-engine — {filteredEvents.length} events
                </span>
              </div>

              {/* Log content */}
              <ScrollArea className="h-[400px]" ref={scrollContainerRef}>
                <div className="p-3 font-mono text-xs leading-relaxed">
                  {loading && events.length === 0 && (
                    <div className="text-zinc-500 animate-pulse">
                      Loading event log...
                    </div>
                  )}

                  {error && (
                    <div className="text-destructive">
                      Error: {error}
                    </div>
                  )}

                  {!loading && filteredEvents.length === 0 && !error && (
                    <div className="text-zinc-500">
                      {searchQuery || accountFilter !== "all" || engineFilter !== "all"
                        ? "No events match current filters."
                        : "No events recorded yet."}
                    </div>
                  )}

                  {filteredEvents.map((ev, i) => (
                    <EventLine key={ev.correlationId + i} event={ev} />
                  ))}

                  <div ref={scrollEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Footer info */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                Showing {filteredEvents.length} of {events.length} events
                {severity !== "all" && ` • filtered: ${severity}`}
              </span>
              <span>Auto-refresh: 10s</span>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ─── Log Line ─────────────────────────────────────────────────────────────────

function EventLine({ event }: { event: MediaEngineEvent }) {
  const time = formatTimestamp(event.timestamp);
  const date = formatDate(event.timestamp);
  const sev = severityPrefix(event.severity);
  const sevClass = severityClass(event.severity);

  // Build detail suffix
  const parts: string[] = [];
  if (event.accountId) parts.push(`acct=${event.accountId}`);
  if (event.engine) parts.push(`eng=${event.engine}`);
  if (event.platform) parts.push(`plat=${event.platform}`);
  if (event.details?.action) parts.push(`action="${event.details.action}"`);
  if (event.details?.message) parts.push(`msg="${event.details.message}"`);

  return (
    <div className="flex gap-2 py-0.5 hover:bg-zinc-900/50 rounded px-1 -mx-1 group">
      <span className="text-zinc-600 shrink-0 select-none">
        {date} {time}
      </span>
      <span className={`shrink-0 font-semibold ${sevClass}`}>
        [{sev}]
      </span>
      <span className="text-zinc-200">
        {event.event}
      </span>
      {parts.length > 0 && (
        <span className="text-zinc-500 truncate">
          {parts.join(" ")}
        </span>
      )}
      <span className="text-zinc-700 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity select-none">
        {event.correlationId.slice(0, 8)}
      </span>
    </div>
  );
}
