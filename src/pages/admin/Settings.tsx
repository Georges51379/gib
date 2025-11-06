import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Settings() {
  const queryClient = useQueryClient();
  const [siteTitle, setSiteTitle] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [passwordEmail, setPasswordEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setSiteTitle(data.site_title);
        setLogoUrl(data.logo_url || '');
        setFaviconUrl(data.favicon_url || '');
        setMaintenanceMode(data.maintenance_mode);
        setMaintenanceMessage(data.maintenance_message || '');
      }

      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('id')
        .single();

      if (!settings?.id) throw new Error('Settings not found');

      const { error } = await supabase
        .from('site_settings')
        .update({
          site_title: siteTitle,
          logo_url: logoUrl,
          favicon_url: faviconUrl,
          maintenance_mode: maintenanceMode,
          maintenance_message: maintenanceMessage,
        })
        .eq('id', settings.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!passwordEmail || !newPassword) {
        throw new Error('Email and password are required');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('update-admin-password', {
        body: { email: passwordEmail, newPassword }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to update password');

      return data;
    },
    onSuccess: () => {
      toast.success('Admin password updated successfully');
      setPasswordEmail('');
      setNewPassword('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update password');
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground mt-2">Manage global site configuration</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Update your site's basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="Georges Boutros"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  This will appear in the browser tab and navigation
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo & Branding</CardTitle>
              <CardDescription>Upload your site logo and favicon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Logo</Label>
                <ImageUploader
                  bucket="site-assets"
                  onUploadComplete={setLogoUrl}
                  currentImage={logoUrl}
                  maxSize={2 * 1024 * 1024}
                />
              </div>

              <div className="space-y-2">
                <Label>Favicon</Label>
                <ImageUploader
                  bucket="site-assets"
                  onUploadComplete={setFaviconUrl}
                  currentImage={faviconUrl}
                  maxSize={2 * 1024 * 1024}
                  accept={{
                    'image/x-icon': ['.ico'],
                    'image/png': ['.png'],
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>
                Temporarily disable public access while keeping admin panel available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance">Enable Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Site visitors will see a maintenance page
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>

              {maintenanceMode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Textarea
                    id="maintenanceMessage"
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="We are currently performing maintenance..."
                    rows={4}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Password Management</CardTitle>
              <CardDescription>
                Update admin user passwords (requires admin authentication)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="passwordEmail">Admin Email</Label>
                <Input
                  id="passwordEmail"
                  type="email"
                  value={passwordEmail}
                  onChange={(e) => setPasswordEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <Button
                onClick={() => updatePasswordMutation.mutate()}
                disabled={updatePasswordMutation.isPending || !passwordEmail || !newPassword}
                variant="destructive"
              >
                {updatePasswordMutation.isPending ? 'Updating Password...' : 'Update Admin Password'}
              </Button>
            </CardContent>
          </Card>

          <Button
            size="lg"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
