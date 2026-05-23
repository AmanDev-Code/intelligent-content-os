"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LaunchPricingAdmin } from "./LaunchPricingAdmin";
import { PaymentHealthMonitor } from "./PaymentHealthMonitor";
import { DiscountCodesAdmin } from "./DiscountCodesAdmin";
import { CreditCard, Ticket, Activity } from "lucide-react";

export function PaymentGatewayAdmin() {
  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Payment Gateway</h2>
      </div>

      <Tabs defaultValue="launch" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:w-fit">
          <TabsTrigger value="launch" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Launch Pricing</span>
            <span className="sm:hidden">Pricing</span>
          </TabsTrigger>
          <TabsTrigger value="coupons" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            <span className="hidden sm:inline">Coupon Codes</span>
            <span className="sm:hidden">Coupons</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Health Monitor</span>
            <span className="sm:hidden">Health</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="launch" className="mt-6">
          <LaunchPricingAdmin />
        </TabsContent>

        <TabsContent value="coupons" className="mt-6">
          <DiscountCodesAdmin />
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <PaymentHealthMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
