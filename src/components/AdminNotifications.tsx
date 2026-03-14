import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Megaphone, Users, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BroadcastForm {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  category: 'marketing' | 'announcement';
  priority: number;
  expiresAt: string;
}

const AdminNotifications: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Array<{id: string, email: string, full_name?: string}>>([]);
  const [form, setForm] = useState<BroadcastForm>({
    title: '',
    message: '',
    type: 'info',
    category: 'marketing',
    priority: 0,
    expiresAt: '',
  });

  const [testForm, setTestForm] = useState({
    userId: 'self',
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    category: 'system',
  });


  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    try {
      setLoading(true);
      
      const payload: any = {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        category: form.category,
        priority: form.priority,
      };

      if (form.expiresAt) {
        payload.expiresAt = new Date(form.expiresAt).toISOString();
      }

      const response = await apiClient.post('/admin/notifications/broadcast', payload);
      
      if (response.success) {
        toast.success('Broadcast notification sent successfully!');
        setForm({
          title: '',
          message: '',
          type: 'info',
          category: 'marketing',
          priority: 0,
          expiresAt: '',
        });
      } else {
        toast.error('Failed to send broadcast notification');
      }
    } catch (error: any) {
      console.error('Failed to send broadcast:', error);
      toast.error(error.response?.data?.message || 'Failed to send broadcast notification');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testForm.title.trim() || !testForm.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    try {
      setLoading(true);
      
      const payload: any = {
        title: testForm.title.trim(),
        message: testForm.message.trim(),
        type: testForm.type,
        category: testForm.category,
      };

      if (testForm.userId.trim() && testForm.userId !== 'self') {
        payload.userId = testForm.userId.trim();
      }

      const response = await apiClient.post('/admin/notifications/test-user', payload);
      
      if (response.success) {
        toast.success('Test notification sent successfully!');
        setTestForm({
          userId: 'self',
          title: '',
          message: '',
          type: 'info',
          category: 'system',
        });
      } else {
        toast.error('Failed to send test notification');
      }
    } catch (error: any) {
      console.error('Failed to send test notification:', error);
      toast.error(error.response?.data?.message || 'Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  const sendQuickNotification = async (type: 'marketing' | 'announcement', preset: any) => {
    try {
      setLoading(true);
      
      const response = await apiClient.post(`/admin/notifications/${type === 'marketing' ? 'marketing-campaign' : 'system-announcement'}`, preset);
      
      if (response.success) {
        toast.success(`${type === 'marketing' ? 'Marketing campaign' : 'System announcement'} sent successfully!`);
      } else {
        toast.error(`Failed to send ${type}`);
      }
    } catch (error: any) {
      console.error(`Failed to send ${type}:`, error);
      toast.error(error.response?.data?.message || `Failed to send ${type}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for test notifications
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // This would be a real API call to get users
        // For now, we'll use mock data
        setUsers([
          { id: 'c9327732-05cd-41dc-9d4f-e0c17b7fbea3', email: 'amanahuja@gmail.com', full_name: 'Aman Ahuja' },
          // Add more users as needed
        ]);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    
    fetchUsers();
  }, []);


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Admin Notifications</h2>
        <p className="text-muted-foreground">Send broadcast notifications and manage user communications</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Broadcast Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Broadcast Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBroadcastSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="broadcast-title">Title</Label>
                <Input
                  id="broadcast-title"
                  placeholder="Notification title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="broadcast-message">Message</Label>
                <Textarea
                  id="broadcast-message"
                  placeholder="Notification message..."
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(value: any) => setForm({ ...form, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          Info
                        </div>
                      </SelectItem>
                      <SelectItem value="success">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Success
                        </div>
                      </SelectItem>
                      <SelectItem value="warning">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Warning
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(value: any) => setForm({ ...form, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.priority.toString()} onValueChange={(value) => setForm({ ...form, priority: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Normal</SelectItem>
                      <SelectItem value="1">High</SelectItem>
                      <SelectItem value="2">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires-at">Expires At (Optional)</Label>
                  <Input
                    id="expires-at"
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Send Broadcast'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Test Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Test Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTestSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-user-select">Select User</Label>
                <Select value={testForm.userId} onValueChange={(value) => setTestForm({ ...testForm, userId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user or leave empty for yourself" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Send to yourself</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{user.full_name || user.email}</span>
                          <span className="text-xs text-muted-foreground">({user.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-title">Title</Label>
                <Input
                  id="test-title"
                  placeholder="Test notification title..."
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-message">Message</Label>
                <Textarea
                  id="test-message"
                  placeholder="Test notification message..."
                  rows={3}
                  value={testForm.message}
                  onChange={(e) => setTestForm({ ...testForm, message: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={testForm.type} onValueChange={(value: any) => setTestForm({ ...testForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={testForm.category} onValueChange={(value) => setTestForm({ ...testForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="generation">Generation</SelectItem>
                      <SelectItem value="publishing">Publishing</SelectItem>
                      <SelectItem value="credits">Credits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Send Test'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default AdminNotifications;