import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function HeroEditor() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [opacity, setOpacity] = useState(0.7);
  const [ctaPrimary, setCtaPrimary] = useState('');
  const [ctaSecondary, setCtaSecondary] = useState('');

  const { isLoading } = useQuery({
    queryKey: ['hero-section'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_section')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setName(data.name);
        setSubtitle(data.subtitle);
        setDescription(data.description);
        setVideoUrl(data.video_url && data.video_url.trim() !== '' ? data.video_url : '');
        setOpacity(data.background_overlay_opacity || 0.7);
        setCtaPrimary(data.cta_primary_text || '');
        setCtaSecondary(data.cta_secondary_text || '');
      }

      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { data: hero } = await supabase
        .from('hero_section')
        .select('id')
        .single();

      if (!hero?.id) throw new Error('Hero section not found');

      // Validate video URL if provided
      const finalVideoUrl = videoUrl && videoUrl.trim() !== '' ? videoUrl.trim() : null;
      
      if (finalVideoUrl && !finalVideoUrl.startsWith('http')) {
        throw new Error('Invalid video URL format');
      }

      const { error } = await supabase
        .from('hero_section')
        .update({
          name,
          subtitle,
          description,
          video_url: finalVideoUrl,
          background_overlay_opacity: opacity,
          cta_primary_text: ctaPrimary,
          cta_secondary_text: ctaSecondary,
        })
        .eq('id', hero.id);

      if (error) throw error;
      
      return finalVideoUrl;
    },
    onSuccess: (finalVideoUrl) => {
      queryClient.invalidateQueries({ queryKey: ['hero-section'] });
      toast.success(
        finalVideoUrl 
          ? 'Hero section updated with video' 
          : 'Hero section updated'
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update hero section');
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
          <h1 className="text-4xl font-bold">Hero Section</h1>
          <p className="text-muted-foreground mt-2">Edit your homepage hero content</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hero Content</CardTitle>
            <CardDescription>Customize the main landing section</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name / Title</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Your Title / Role"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor content={description} onChange={setDescription} />
            </div>

            <div className="space-y-2">
              <Label>Background Video</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Upload an MP4 video for the hero background. Max 50MB
              </p>
              <ImageUploader
                bucket="site-assets"
                onUploadComplete={(url) => {
                  console.log('Video upload complete, URL:', url);
                  setVideoUrl(url || '');
                }}
                currentImage={videoUrl || undefined}
                accept={{
                  'video/mp4': ['.mp4'],
                  'video/webm': ['.webm'],
                  'video/ogg': ['.ogg']
                }}
                maxSize={50 * 1024 * 1024}
              />
              {videoUrl && videoUrl.trim() !== '' && (
                <div className="mt-4 space-y-2">
                  <Label>Current Video URL</Label>
                  <p className="text-xs text-muted-foreground break-all">{videoUrl}</p>
                  <Label>Preview</Label>
                  <video 
                    src={videoUrl} 
                    className="w-full max-w-md rounded-lg border border-border"
                    controls
                    muted
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Overlay Opacity: {opacity.toFixed(2)}</Label>
              <Slider
                value={[opacity]}
                onValueChange={(values) => setOpacity(values[0])}
                max={1}
                step={0.05}
                min={0}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctaPrimary">Primary Button Text</Label>
                <Input
                  id="ctaPrimary"
                  value={ctaPrimary}
                  onChange={(e) => setCtaPrimary(e.target.value)}
                  placeholder="See My Work"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaSecondary">Secondary Button Text</Label>
                <Input
                  id="ctaSecondary"
                  value={ctaSecondary}
                  onChange={(e) => setCtaSecondary(e.target.value)}
                  placeholder="Contact Me"
                />
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
