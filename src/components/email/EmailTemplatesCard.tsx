import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import {
  Mail,
  Send,
  Eye,
  Settings,
} from 'lucide-react';
import { EMAIL_TEMPLATES } from '@/templates/email/emailTemplates';
import { API_CONFIG } from '@/lib/constants';

interface EmailTemplatesCardProps {
  onEmailSent?: () => void;
}

export function EmailTemplatesCard({ onEmailSent }: EmailTemplatesCardProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('verification');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  const selectedTemplateData = EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate);

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({
        title: 'Error',
        description: 'Please enter a test email address',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const response = await apiClient.post('/email/test', {
        to: testEmail,
        type: selectedTemplate,
      });

      if (response.success) {
        toast({
          title: 'Test Email Sent',
          description: `Test email sent to ${testEmail}`,
        });
        setTestEmail('');
        onEmailSent?.();
      } else {
        throw new Error(response.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test email',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Template List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {EMAIL_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {template.description}
                      </p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-muted text-xs rounded">
                        {template.category}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Template Details & Testing */}
      <div className="lg:col-span-2 space-y-6">
        {/* Template Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {selectedTemplateData?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTemplateData?.description}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Category</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTemplateData?.category}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Template ID</Label>
                <code className="text-sm bg-muted px-2 py-1 rounded mt-1 block">
                  {selectedTemplate}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Test Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-email">Test Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleSendTest}
                disabled={sending || !testEmail}
                className="w-full"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Email Configuration
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
                  {API_CONFIG.BASE_URL}/webhook/email-delivery
                </code>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure this URL in SMTP2GO with JSON output type
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">API Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-muted-foreground">SMTP2GO Connected</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
