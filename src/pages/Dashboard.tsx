import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format } from "date-fns";
import { useScheduledPosts } from "@/hooks/useScheduledPosts";
import { KPIStrip } from "@/components/dashboard/KPIStrip";
import { CalendarGrid } from "@/components/dashboard/CalendarGrid";
import { DayView } from "@/components/dashboard/DayView";
import { WeekView } from "@/components/dashboard/WeekView";
import { ListView } from "@/components/dashboard/ListView";
import { SocialChannels } from "@/components/dashboard/SocialChannels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { CALENDAR_VIEWS, type CalendarView } from "@/lib/constants";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [view, setView] = useState<CalendarView>("Month");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Compute date range for data fetching based on view
  const { rangeStart, rangeEnd } = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return {
      rangeStart: startOfWeek(monthStart).toISOString(),
      rangeEnd: endOfWeek(monthEnd).toISOString(),
    };
  }, [currentDate]);

  const { posts, loading } = useScheduledPosts(rangeStart, rangeEnd);

  // Filter posts
  const filteredPosts = useMemo(() => {
    let result = posts;
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }
    return result;
  }, [posts, statusFilter, searchQuery]);

  const handleAddPost = (date: Date) => {
    navigate("/ai-agent");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* KPI Strip */}
      <KPIStrip />

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Calendar section */}
        <Card className="p-4 border border-border">
          {/* Calendar header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Content Calendar</h2>
              <span className="text-xs text-muted-foreground">
                {filteredPosts.length} posts
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-7 w-36 pl-7 text-xs"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-7 w-24 text-xs">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                className="h-7 text-xs gradient-primary text-primary-foreground"
                onClick={() => navigate("/ai-agent")}
              >
                <Plus className="h-3 w-3 mr-1" /> Create Post
              </Button>
            </div>
          </div>

          {/* View tabs */}
          <div className="flex items-center gap-1 mb-4 border-b border-border pb-2">
            {CALENDAR_VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  view === v
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Calendar views */}
          {view === "Month" && (
            <CalendarGrid
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              posts={filteredPosts}
              onAddPost={handleAddPost}
              onSelectDay={(day) => {
                setSelectedDay(day);
                setView("Day");
              }}
            />
          )}

          {view === "Day" && (
            <DayView
              selectedDate={selectedDay}
              posts={filteredPosts}
              onAddPost={handleAddPost}
            />
          )}

          {view === "Week" && (
            <WeekView
              selectedDate={selectedDay}
              posts={filteredPosts}
              onAddPost={handleAddPost}
            />
          )}

          {view === "List" && (
            <ListView posts={filteredPosts} loading={loading} />
          )}
        </Card>

        {/* Sidebar: Social Channels */}
        <div className="space-y-4">
          <SocialChannels />
        </div>
      </div>
    </div>
  );
}
