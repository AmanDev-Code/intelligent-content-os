import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { apiClient } from '@/lib/apiClient';
import { 
  Mail, 
  Eye, 
  Settings, 
  Users, 
  CreditCard, 
  UserPlus, 
  Shield,
  BarChart3,
  Filter,
  CheckCircle,
  MousePointer,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { EmailTemplatesCard } from '@/components/email/EmailTemplatesCard';

const EMAIL_TEMPLATES = [
  {
    id: 'verification',
    name: 'Email Verification',
    description: 'Sent to new users to verify their email address',
    icon: Shield,
    category: 'Authentication',
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Sent when users request a password reset',
    icon: Shield,
    category: 'Authentication',
  },
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent to users after email verification',
    icon: UserPlus,
    category: 'Onboarding',
  },
  {
    id: 'upgrade',
    name: 'Account Upgrade',
    description: 'Sent when users upgrade their subscription',
    icon: CreditCard,
    category: 'Billing',
  },
  {
    id: 'order-receipt',
    name: 'Order Receipt',
    description: 'Sent after successful payment',
    icon: CreditCard,
    category: 'Billing',
  },
  {
    id: 'invitation',
    name: 'User Invitation',
    description: 'Sent to invite new users to the platform',
    icon: Users,
    category: 'Social',
  },
];

interface EmailLog {
  id: string;
  email_id: string;
  recipient: string;
  subject: string;
  status: string;
  template_id: string;
  sent_at: string;
  delivered_at?: string;
  webhook_data?: any;
}

interface EmailStats {
  total: number;
  sent: number;
  delivered: number;
  bounced: number;
  opened: number;
  clicked: number;
  by_template: Record<string, number>;
  by_status: Record<string, number>;
}

export default function EmailDashboard() {
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  
  // Email logs state
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    template_id: '',
    recipient: '',
    from_date: '',
    to_date: '',
  });

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const fetchEmailLogs = async (resetPage = false) => {
    setLoading(true);
    setLogsError(null);
    try {
      const currentPage = resetPage ? 1 : page;
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '20');
      Object.entries(filters).forEach(([k, v]) => {
        if (v && String(v).trim()) params.set(k, String(v));
      });

      const response = await apiClient.get(`/email/logs?${params.toString()}`);
      if (response.success) {
        const data = response.data ?? [];
        if (resetPage) {
          setEmailLogs(Array.isArray(data) ? data : []);
          setPage(1);
        } else {
          setEmailLogs(prev => [...prev, ...(Array.isArray(data) ? data : [])]);
        }
        setTotal(response.total ?? 0);
      } else {
        setLogsError(response.error || 'Failed to load logs');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch email logs';
      setLogsError(msg);
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);

      const response = await apiClient.get(`/email/stats?${params}`);
      if (response.success) {
        setEmailStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };

  useEffect(() => {
    fetchEmailLogs(true);
    fetchEmailStats();
  }, [filters.status, filters.template_id, filters.recipient, filters.from_date, filters.to_date]);

  const getTemplateIcon = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    return template?.icon || Mail;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor email delivery, test templates, and track performance
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          {emailStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailStats.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">All emails sent</p>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{emailStats.delivered.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {emailStats.total > 0 ? ((emailStats.delivered / emailStats.total) * 100).toFixed(1) : 0}% delivery rate
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Opened</CardTitle>
                  <Eye className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{emailStats.opened.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {emailStats.delivered > 0 ? ((emailStats.opened / emailStats.delivered) * 100).toFixed(1) : 0}% open rate
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clicked</CardTitle>
                  <MousePointer className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{emailStats.clicked.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {emailStats.opened > 0 ? ((emailStats.clicked / emailStats.opened) * 100).toFixed(1) : 0}% click rate
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Template Performance */}
          {emailStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Template Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(emailStats.by_template).length > 0 ? (
                      Object.entries(emailStats.by_template).map(([templateId, count]) => {
                        const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
                        const Icon = template?.icon || Mail;
                        return (
                          <div key={templateId} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="text-sm font-medium truncate">
                                {template?.name || (templateId === 'custom' ? 'Custom' : templateId)}
                              </span>
                            </div>
                            <Badge variant="secondary" className="flex-shrink-0">{count}</Badge>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-6 space-y-3">
                        <p className="text-sm text-muted-foreground">No template data yet. Template stats will appear after emails are sent.</p>
                        <div className="space-y-2">
                          {EMAIL_TEMPLATES.slice(0, 3).map((t) => (
                            <div key={t.id} className="flex items-center justify-between text-sm text-muted-foreground/70">
                              <span>{t.name}</span>
                              <span>0</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(emailStats.by_status).length > 0 ? (
                      Object.entries(emailStats.by_status).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium capitalize">{status}</span>
                          <Badge variant="secondary" className="flex-shrink-0">{count}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground py-4">No status data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Email Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={filters.status || 'all'} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="bounced">Bounced</SelectItem>
                      <SelectItem value="opened">Opened</SelectItem>
                      <SelectItem value="clicked">Clicked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Template</Label>
                  <Select 
                    value={filters.template_id || 'all'} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, template_id: value === 'all' ? '' : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All templates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All templates</SelectItem>
                      {EMAIL_TEMPLATES.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Recipient</Label>
                  <Input
                    placeholder="Filter by email"
                    value={filters.recipient}
                    onChange={(e) => setFilters(prev => ({ ...prev, recipient: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={filters.from_date}
                    onChange={(e) => setFilters(prev => ({ ...prev, from_date: e.target.value }))}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      fetchEmailLogs(true);
                      fetchEmailStats();
                    }}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Email Logs ({total.toLocaleString()} total)</CardTitle>
            </CardHeader>
            <CardContent>
              {logsError && (
                <div className="mb-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {logsError}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => fetchEmailLogs(true)}
                  >
                    Retry
                  </Button>
                </div>
              )}
              <div className="space-y-4">
                {emailLogs.length === 0 && !loading && !logsError && (
                  <div className="py-12 text-center text-muted-foreground">
                    {total === 0 ? 'No email logs yet. Send a test email to see logs here.' : 'No logs match your filters.'}
                  </div>
                )}
                {emailLogs.map((log) => {
                  const Icon = getTemplateIcon(log.template_id || '');
                  return (
                    <div key={log.id} className="flex items-center justify-between gap-4 p-4 border rounded-lg min-w-0">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{log.recipient}</div>
                          <div className="text-sm text-muted-foreground truncate">{log.subject}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(log.sent_at)}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-medium capitalize text-muted-foreground flex-shrink-0">
                        {log.status}
                      </span>
                    </div>
                  );
                })}

                {emailLogs.length < total && (
                  <div className="text-center pt-4">
                    <Button
                      onClick={() => {
                        setPage(prev => prev + 1);
                        fetchEmailLogs();
                      }}
                      disabled={loading}
                      variant="outline"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <EmailTemplatesCard
            onEmailSent={() => {
              fetchEmailLogs(true);
              fetchEmailStats();
            }}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                SMTP2GO Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">SMTP Provider</Label>
                  <p className="text-sm text-muted-foreground mt-1">SMTP2GO</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">From Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    noreply@postra.katana-ai.com
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">From Name</Label>
                  <p className="text-sm text-muted-foreground mt-1">Postra Team</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Webhook URL</Label>
                  <code className="text-sm bg-muted px-2 py-1 rounded mt-1 block break-all">
                    https://alfonso-pseudooriental-cyclonically.ngrok-free.dev/webhook/email-delivery
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure this URL in SMTP2GO webhook settings with JSON output type
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">API Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">SMTP2GO Connected</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}