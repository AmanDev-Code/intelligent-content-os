import { Card } from "@/components/ui/card";
import { Gift } from "lucide-react";

export default function Affiliate() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="p-12 text-center border border-border max-w-md">
        <Gift className="h-10 w-10 mx-auto mb-4 text-primary" />
        <h2 className="text-lg font-semibold mb-2">Affiliate Program</h2>
        <p className="text-sm text-muted-foreground">
          Our affiliate program is coming soon. Earn commissions by referring users to ContentOS.
        </p>
      </Card>
    </div>
  );
}
