import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, XCircle, CheckCircle } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string;
  content: string;
  cover_image_url: string;
  tags: string[] | null;
  featured: boolean | null;
  status: string | null;
  display_order: number;
  author: string | null;
  reading_time_minutes: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function BlogManager() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [featured, setFeatured] = useState(false);
  const [readingTime, setReadingTime] = useState('5');

  const { data: posts } = useQuery({
    queryKey: ['blog-posts-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as unknown as BlogPost[];
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCoverImageUrl('');
    setTags('');
    setFeatured(false);
    setReadingTime('5');
  };

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) setSlug(generateSlug(val));
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug || '');
    setExcerpt(post.excerpt);
    setContent(post.content);
    setCoverImageUrl(post.cover_image_url);
    setTags(post.tags?.join(', ') || '');
    setFeatured(post.featured || false);
    setReadingTime(String(post.reading_time_minutes || 5));
    setIsOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const displayOrder = editingId
        ? (posts?.find(p => p.id === editingId)?.display_order || 0)
        : (posts?.length || 0) + 1;

      const postData: any = {
        title,
        slug: slug || generateSlug(title),
        excerpt,
        content,
        cover_image_url: coverImageUrl,
        tags: tagsArray,
        featured,
        reading_time_minutes: parseInt(readingTime) || 5,
      };

      if (editingId) {
        const { error } = await supabase
          .from('blog_posts' as any)
          .update(postData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts' as any)
          .insert({ ...postData, display_order: displayOrder });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts-admin'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success(editingId ? 'Updated successfully' : 'Created successfully');
      setIsOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save');
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts' as any).update({ status: 'inactive' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts-admin'] });
      toast.success('Blog post deactivated');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts' as any).update({ status: 'active' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts-admin'] });
      toast.success('Blog post reactivated');
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Blog</h1>
            <p className="text-muted-foreground mt-2">Manage your blog posts</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Blog Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated-from-title" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Excerpt</Label>
                  <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} placeholder="Brief summary of the article..." />
                </div>
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <ImageUploader bucket="site-assets" onUploadComplete={setCoverImageUrl} currentImage={coverImageUrl} />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <RichTextEditor content={content} onChange={setContent} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tags (comma separated)</Label>
                    <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="React, Web Dev, Tutorial" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reading Time (minutes)</Label>
                    <Input type="number" value={readingTime} onChange={(e) => setReadingTime(e.target.value)} min="1" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={featured} onCheckedChange={setFeatured} />
                  <Label>Featured Post</Label>
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !coverImageUrl || !title || !excerpt}>
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts?.map((post) => (
            <Card key={post.id}>
              <img src={post.cover_image_url} alt={post.title} className="w-full h-48 object-cover" />
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1">{post.title}</span>
                  <div className="flex gap-2 shrink-0">
                    {post.featured && <Badge>Featured</Badge>}
                    <Badge variant={post.status === 'active' ? 'default' : 'secondary'}>
                      {post.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {post.status === 'active' ? (
                    <Button variant="ghost" size="sm" onClick={() => softDeleteMutation.mutate(post.id)}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Deactivate
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => reactivateMutation.mutate(post.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Reactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
