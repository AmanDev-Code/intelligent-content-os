import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

interface UsageRow {
  date: string;
  generations_count: number;
  credits_used: number;
  publications_count: number;
}

export default function Analytics() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");

  useEffect(() => {
    if (!user) return;
    const fetchUsage = async () => {
      setLoading(true);
      const since = startOfDay(subDays(new Date(), parseInt(range))).toISOString();
      const { data } = await supabase
        .from("user_usage")
        .select("date, generations_count, credits_used, publications_count")
        .eq("user_id", user.id)
        .gte("date", since.split("T")[0])
        .order("date", { ascending: true });
      setUsage((data as UsageRow[] | null) ?? []);
      setLoading(false);
    };
    fetchUsage();
  }, [user, range]);

  const totals = useMemo(() => ({
    generations: usage.reduce((s, u) => s + u.generations_count, 0),
    credits: usage.reduce((s, u) => s + u.credits_used, 0),
    publications: usage.reduce((s, u) => s + u.publications_count, 0),
  }), [usage]);

  const chartData = useMemo(() =>
    usage.map((u) => ({
      date: format(new Date(u.date), "MMM d"),
      generations: u.generations_count,
      credits: u.credits_used,
      publications: u.publications_count,
    })),
    [usage]
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Analytics Overview</h2>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="h-7 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Generations</span>
          </div>
          <p className="text-2xl font-bold">{loading ? "—" : totals.generations}</p>
        </Card>
        <Card className="p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Publications</span>
          </div>
          <p className="text-2xl font-bold">{loading ? "—" : totals.publications}</p>
        </Card>
        <Card className="p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Credits Used</span>
          </div>
          <p className="text-2xl font-bold">{loading ? "—" : totals.credits}</p>
        </Card>
      </div>

      {/* Charts */}
      {!loading && chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4 border border-border">
            <h3 className="text-xs font-medium text-muted-foreground mb-4">Generations Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 12, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="generations" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4 border border-border">
            <h3 className="text-xs font-medium text-muted-foreground mb-4">Credits Used Per Day</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 12, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="credits" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      ) : !loading ? (
        <Card className="p-12 text-center border border-border">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No usage data yet. Start generating content to see analytics.</p>
        </Card>
      ) : null}
    </div>
  );
}
