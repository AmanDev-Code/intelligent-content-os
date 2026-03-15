import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { QuotaProvider } from "@/contexts/QuotaContext";
import { LinkedInProvider } from "@/contexts/LinkedInContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "next-themes";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Invite from "./pages/Invite";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Agent from "./pages/Agent";
import Analytics from "./pages/Analytics";
import Media from "./pages/Media";
import Affiliate from "./pages/Affiliate";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import PostDetail from "./pages/PostDetail";
import Generations from "./pages/Generations";
import EmailDashboard from "./pages/EmailDashboard";
import ScheduledPosts from "./pages/ScheduledPosts";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <QuotaProvider>
            <LinkedInProvider>
              <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/invite" element={<Invite />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/agent" element={<Agent />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/media" element={<Media />} />
                <Route path="/affiliate" element={<Affiliate />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/generations" element={<Generations />} />
                <Route path="/scheduled-posts" element={<ScheduledPosts />} />
                <Route path="/email-templates" element={<EmailDashboard />} />
                <Route path="/content/:slug" element={<PostDetail />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
              </NotificationProvider>
            </LinkedInProvider>
          </QuotaProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
