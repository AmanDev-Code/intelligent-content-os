"use client";

interface ScoreRadarProps {
  scores: {
    seo: number;
    aeo: number;
    geo: number;
    eeat: number;
    readability: number;
  };
  overall: number;
}

export function ScoreRadar({ scores, overall }: ScoreRadarProps) {
  const items = [
    { label: "SEO", value: scores.seo, color: "bg-blue-500" },
    { label: "AEO", value: scores.aeo, color: "bg-purple-500" },
    { label: "GEO", value: scores.geo, color: "bg-emerald-500" },
    { label: "E-E-A-T", value: scores.eeat, color: "bg-amber-500" },
    { label: "Readability", value: scores.readability, color: "bg-pink-500" },
  ];

  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-600";
    if (val >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      {/* Overall score badge */}
      <div className="flex items-center gap-3">
        <div className={`text-3xl font-bold ${getScoreColor(overall)}`}>{overall}</div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Overall Quality</p>
          <p className="text-xs text-muted-foreground">Average of all dimensions</p>
        </div>
      </div>

      {/* Score bars */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">
              {item.label}
            </span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${item.color} transition-all duration-500`}
                style={{ width: `${item.value}%` }}
              />
            </div>
            <span className={`text-xs font-semibold w-8 text-right ${getScoreColor(item.value)}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
