import { FileText, Send, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/hooks/useCountUp";

function AnimatedValue({ value, suffix = "" }: { value: number; suffix?: string }) {
  const animated = useCountUp(value);
  const isDecimal = value % 1 !== 0;
  return (
    <span>
      {isDecimal ? animated.toFixed(1) : Math.round(animated)}
      {suffix}
    </span>
  );
}

const kpis = [
  { label: "Posts Generated", value: 24, suffix: "", change: "+3 this week", icon: FileText, color: "text-primary" },
  { label: "Published", value: 18, suffix: "", change: "+2 this week", icon: Send, color: "text-accent" },
  { label: "Avg AI Score", value: 8.4, suffix: "", change: "+0.3", icon: BarChart3, color: "text-chart-3" },
  { label: "Performance", value: 12, suffix: "%", change: "vs last month", icon: TrendingUp, color: "text-chart-5" },
];

export function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <Card
          key={kpi.label}
          className="glass group hover:glow-primary transition-all duration-300 hover:-translate-y-1 cursor-default animate-fade-in-up hover:border-primary/30"
          style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} aria-hidden="true" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {kpi.suffix === "%" && "+"}
              <AnimatedValue value={kpi.value} suffix={kpi.suffix} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
