import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Gift,
  Star,
  Clock,
  Mail
} from "lucide-react";

export default function Affiliate() {
  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Affiliate Program</h1>
          <p className="text-muted-foreground text-lg">
            Earn money by referring Postra AI to your network
          </p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
              <Gift className="h-10 w-10 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Coming Soon!</h2>
              <p className="text-muted-foreground">
                We're building an amazing affiliate program that will let you earn generous commissions 
                by sharing Postra AI with your audience.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 sm:my-8">
              <div className="text-center p-4">
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-3">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-medium">High Commissions</h3>
                <p className="text-sm text-muted-foreground">Earn up to 30% on every referral</p>
              </div>
              
              <div className="text-center p-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-medium">Real-time Tracking</h3>
                <p className="text-sm text-muted-foreground">Monitor your earnings and conversions</p>
              </div>
              
              <div className="text-center p-4">
                <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-3">
                  <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-medium">Marketing Materials</h3>
                <p className="text-sm text-muted-foreground">Get banners, links, and resources</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Want to be notified when the affiliate program launches?
              </p>
              <Button className="gradient-primary">
                <Mail className="h-4 w-4 mr-2" />
                Notify Me When Ready
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-center mb-6">What to Expect</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Competitive Payouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 30% commission on first month</li>
                <li>• 15% recurring commission</li>
                <li>• Monthly payouts via PayPal or Stripe</li>
                <li>• No minimum payout threshold</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Advanced Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time conversion tracking</li>
                <li>• Detailed performance reports</li>
                <li>• Customer lifetime value metrics</li>
                <li>• A/B testing for your links</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-500" />
                Marketing Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Custom landing pages</li>
                <li>• Email templates and sequences</li>
                <li>• Social media assets</li>
                <li>• Video testimonials</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Easy Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Simple dashboard interface</li>
                <li>• One-click link generation</li>
                <li>• Automated commission tracking</li>
                <li>• 24/7 affiliate support</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}