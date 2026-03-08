import { useProfile } from "@/hooks/useProfile";
import { PLAN_TIERS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

export default function Billing() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const currentPlan = profile?.plan ?? "free";
  const creditsUsed = (profile?.monthly_credits ?? 5) - (profile?.credits_remaining ?? 0);
  const creditsTotal = profile?.monthly_credits ?? 5;
  const usagePercent = creditsTotal > 0 ? (creditsUsed / creditsTotal) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Current usage */}
      <Card className="p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Current Plan</h3>
          <Badge variant="secondary" className="capitalize text-xs">{currentPlan}</Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Credits used this month</span>
            <span>{creditsUsed} / {creditsTotal}</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
        </div>
      </Card>

      {/* Plan tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAN_TIERS.map((tier) => {
          const isCurrentPlan = tier.id === currentPlan;
          return (
            <Card key={tier.id} className={`p-5 border ${isCurrentPlan ? "border-primary" : "border-border"}`}>
              <h4 className="text-sm font-semibold">{tier.name}</h4>
              <p className="text-2xl font-bold mt-2">{tier.price}</p>
              <p className="text-xs text-muted-foreground mb-4">
                {tier.credits > 0 ? `${tier.credits} credits/month` : "Unlimited"}
              </p>
              <ul className="space-y-1.5 mb-4">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={isCurrentPlan ? "secondary" : "default"}
                size="sm"
                className={`w-full text-xs ${!isCurrentPlan ? "gradient-primary text-primary-foreground" : ""}`}
                disabled={isCurrentPlan}
                onClick={() => {
                  if (!isCurrentPlan) {
                    toast({ title: "Upgrade coming soon", description: "Payment integration will be available soon." });
                  }
                }}
              >
                {isCurrentPlan ? "Current Plan" : "Upgrade"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
