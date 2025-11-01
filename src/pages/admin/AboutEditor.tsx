import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AboutEditor() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [contentIntro, setContentIntro] = useState('');
  const [contentMain, setContentMain] = useState('');

  const { isLoading } = useQuery({
    queryKey: ['about-section'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_section')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setTitle(data.title);
        setSubtitle(data.subtitle || '');
        setImageUrl(data.image_url);
        setContentIntro(data.content_intro);
        setContentMain(data.content_main);
      }

      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { data: about } = await supabase
        .from('about_section')
        .select('id')
        .single();

      if (about?.id) {
        const { error } = await supabase
          .from('about_section')
          .update({
            title,
            subtitle,
            image_url: imageUrl,
            content_intro: contentIntro,
            content_main: contentMain,
          })
          .eq('id', about.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('about_section')
          .insert({
            title,
            subtitle,
            image_url: imageUrl,
            content_intro: contentIntro,
            content_main: contentMain,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-section'] });
      toast.success('About section updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update about section');
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
          <h1 className="text-4xl font-bold">About Section</h1>
          <p className="text-muted-foreground mt-2">Edit your about page content</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>About Content</CardTitle>
            <CardDescription>Customize your about section</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="About Me"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle (Optional)</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Get to know me better"
              />
            </div>

            <div className="space-y-2">
              <Label>Profile Image</Label>
              <ImageUploader
                bucket="about-images"
                onUploadComplete={setImageUrl}
                currentImage={imageUrl}
              />
            </div>

            <div className="space-y-2">
              <Label>Introduction Content</Label>
              <RichTextEditor content={contentIntro} onChange={setContentIntro} />
            </div>

            <div className="space-y-2">
              <Label>Main Content</Label>
              <RichTextEditor content={contentMain} onChange={setContentMain} />
            </div>

            <Button
              size="lg"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || !imageUrl}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
