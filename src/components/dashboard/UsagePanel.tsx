import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Wallet,
  Zap,
  ChevronDown,
  ChevronUp,
  Send,
  CalendarPlus,
  RefreshCw,
  Clock,
  CalendarClock,
  Gift,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api, type CreditBalance } from "@/lib/apiClient";
import { useCreditCosts } from "@/lib/creditCosts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "lucide-react";

/**
 * Sprint 2.1 — Horizontal Compact Credit Bar
 *
 * Space-efficient horizontal layout with mini progress bars,
 * inline plan info, and expandable details section.
 * Height: ~64px compact, expands to ~300px for details.
 */

// Animation utility for counting numbers
function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (target - startValue) * easeProgress);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
    return () => setIsAnimating(false);
  }, [target, duration]);

  return { count, isAnimating };
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  try {
    const target = new Date(iso).getTime();
    if (Number.isNaN(target)) return null;
    const diffMs = target - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  } catch {
    return null;
  }
}

const fmt = (n: number) =>
  Number.isInteger(n) ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 1 });

interface MiniProgressProps {
  value: number;
  max: number;
  size?: "sm" | "md";
  colorClass?: string;
}

function MiniProgress({ value, max, size = "sm", colorClass = "bg-primary" }: MiniProgressProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const heightClass = size === "sm" ? "h-1" : "h-1.5";

  return (
    <div className={cn("w-full bg-muted rounded-full overflow-hidden", heightClass)}>
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-out", colorClass)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

interface CreditIndicatorProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  max: number;
  iconClass?: string;
  barClass?: string;
}

function CreditIndicator({
  icon: Icon,
  label,
  value,
  max,
  iconClass = "text-primary",
  barClass = "bg-primary",
}: CreditIndicatorProps) {
  const { count: animatedValue } = useCountUp(value, 800);
  const { count: animatedMax } = useCountUp(max, 800);

  return (
    <div className="flex items-center gap-2 min-w-[120px] flex-1">
      <Icon className={cn("h-4 w-4 shrink-0", iconClass)} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground truncate">{label}</span>
          <span className="font-medium tabular-nums ml-2">
            {fmt(animatedValue)}/{fmt(animatedMax)}
          </span>
        </div>
        <div className="mt-1">
          <MiniProgress value={value} max={max} barClass={barClass} />
        </div>
      </div>
    </div>
  );
}

interface BucketChipProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  amount: number;
  detail: string;
  iconClass?: string;
}

function BucketChip({ icon: Icon, label, amount, detail, iconClass }: BucketChipProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50 border border-border/50">
      <Icon className={cn("h-3.5 w-3.5 shrink-0", iconClass)} />
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-xs font-medium tabular-nums">{fmt(amount)}</span>
        <span className="text-[10px] text-muted-foreground truncate">{label}</span>
      </div>
      <span className="text-[10px] text-muted-foreground/70 ml-auto">{detail}</span>
    </div>
  );
}

interface ActionCostRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  cost: string;
}

function ActionCostRow({ icon: Icon, label, cost }: ActionCostRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className="text-xs font-medium tabular-nums px-2 py-0.5 rounded-full bg-primary/10 text-primary">
        {cost}
      </span>
    </div>
  );
}

export function UsagePanel() {
  const { user } = useAuth();
  const costs = useCreditCosts();
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    setLoading(true);
    api.credits
      .balance()
      .then((data) => {
        if (!cancelled) setBalance(data);
      })
      .catch((err) => {
        console.error("UsagePanel: failed to load credit balance", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const total = balance?.total ?? 0;
  const consumed = balance?.consumedThisPeriod ?? 0;
  const available = Math.max(0, total - consumed);

  const trialDays = useMemo(
    () => daysUntil(balance?.trialExpiresAt ?? null),
    [balance?.trialExpiresAt],
  );

  const planDays = useMemo(
    () => daysUntil(balance?.planResetsAt ?? null),
    [balance?.planResetsAt],
  );

  const isZero = total <= 0;
  const trialExpired = balance?.trial && balance.trial > 0 && trialDays === 0;

  // Calculate percentage and color
  const percentageUsed = total > 0 ? (consumed / total) * 100 : 0;
  const getBarColor = () => {
    if (percentageUsed >= 90) return "bg-destructive";
    if (percentageUsed >= 70) return "bg-amber-500";
    return "bg-primary";
  };

  if (loading) {
    return (
      <div className="w-full bg-card border border-border/50 rounded-xl">
        <div className="px-4 py-3 flex items-center gap-6">
          <div className="animate-pulse flex items-center gap-4 flex-1">
            <div className="h-4 w-4 rounded bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-muted rounded w-20" />
              <div className="h-1 bg-muted rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!balance) return null;

  return (
    <div className="w-full bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/20 transition-colors duration-200">
      {/* Compact Horizontal Bar */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Credits Indicator */}
          <CreditIndicator
            icon={Wallet}
            label="Credits"
            value={available}
            max={total}
            barClass={getBarColor()}
          />

          {/* Divider - hidden on mobile */}
          <div className="hidden sm:block w-px h-8 bg-border shrink-0" />

          {/* Plan Info */}
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5 h-5">
              {balance.planDisplayName}
            </Badge>
            {planDays != null && planDays > 0 && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Renews in {planDays}d
              </span>
            )}
          </div>

          {/* Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer shrink-0"
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
            title={isExpanded ? "Hide details" : "Show details"}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details Section */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out border-t border-border/30",
          isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <div className="px-4 py-4 space-y-4">
          {/* Credit Buckets */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              Credit Breakdown
            </p>
            <div className="flex flex-wrap gap-2">
              {(balance.trial > 0 || balance.trialExpiresAt) && (
                <BucketChip
                  icon={Clock}
                  label="Trial"
                  amount={balance.trial}
                  detail={trialExpired ? "Expired" : trialDays != null ? `${trialDays}d left` : "14 days"}
                  iconClass="text-violet-500"
                />
              )}
              <BucketChip
                icon={CalendarClock}
                label="Plan"
                amount={balance.plan}
                detail={balance.planResetsAt ? `Resets ${formatDate(balance.planResetsAt)}` : "Monthly"}
                iconClass="text-primary"
              />
              {balance.reward > 0 && (
                <BucketChip
                  icon={Gift}
                  label="Rewards"
                  amount={balance.reward}
                  detail="Never expire"
                  iconClass="text-emerald-500"
                />
              )}
            </div>
          </div>

          {/* Action Costs */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              Action Costs
            </p>
            <div className="bg-muted/30 rounded-lg px-3 py-2 space-y-0.5">
              <ActionCostRow
                icon={Send}
                label="Post Now"
                cost={`${costs.postNow.text}/${costs.postNow.image}/${costs.postNow.carousel}`}
              />
              <ActionCostRow
                icon={CalendarPlus}
                label="Schedule"
                cost={`${costs.schedule.text}/${costs.schedule.image}/${costs.schedule.carousel}`}
              />
              <ActionCostRow
                icon={RefreshCw}
                label="Regenerate"
                cost={`${costs.regenerate.singleImage}/${costs.regenerate.slidePerUnit}`}
              />
            </div>
            <p className="text-[10px] text-muted-foreground/60">
              +{costs.pdfAddOn} credits for PDF attachments
            </p>
          </div>
        </div>
      </div>

      {/* Low Credits Warning */}
      {isZero && (
        <div className="mx-4 mb-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Out of credits</p>
              <p className="text-xs text-destructive/80">Upgrade to continue posting</p>
            </div>
            <Link href="/billing">
              <Button size="sm" className="h-8 text-xs">
                Upgrade
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
