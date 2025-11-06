import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, XCircle, CheckCircle } from 'lucide-react';

type Testimonial = {
  id: string;
  name: string;
  role: string;
  feedback: string;
  image_url: string;
  display_order: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function TestimonialsManager() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [feedback, setFeedback] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { data: testimonials } = useQuery({
    queryKey: ['testimonials-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials' as any)
        .select('*')
        .order('display_order');
      if (error) throw error;
      return (data as unknown) as Testimonial[];
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setFeedback('');
    setImageUrl('');
  };

  const handleEdit = (testimonial: any) => {
    setEditingId(testimonial.id);
    setName(testimonial.name);
    setRole(testimonial.role);
    setFeedback(testimonial.feedback);
    setImageUrl(testimonial.image_url);
    setIsOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const displayOrder = editingId
        ? (testimonials?.find((t) => t.id === editingId)?.display_order || 0)
        : (testimonials?.length || 0) + 1;

      if (editingId) {
        const { error } = await supabase
          .from('testimonials' as any)
          .update({
            name,
            role,
            feedback,
            image_url: imageUrl,
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('testimonials' as any).insert({
          name,
          role,
          feedback,
          image_url: imageUrl,
          display_order: displayOrder,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials-list'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
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
      const { error } = await supabase.from('testimonials' as any).update({ status: 'inactive' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials-list'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial deactivated successfully');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('testimonials' as any).update({ status: 'active' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials-list'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial reactivated successfully');
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Testimonials</h1>
            <p className="text-muted-foreground mt-2">Manage client testimonials</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Testimonial</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sarah Johnson" />
                </div>
                <div className="space-y-2">
                  <Label>Role / Position</Label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="CEO at TechStart" />
                </div>
                <div className="space-y-2">
                  <Label>Client Photo</Label>
                  <ImageUploader bucket="project-images" onUploadComplete={setImageUrl} currentImage={imageUrl} />
                </div>
                <div className="space-y-2">
                  <Label>Feedback</Label>
                  <Textarea 
                    value={feedback} 
                    onChange={(e) => setFeedback(e.target.value)} 
                    rows={5}
                    placeholder="Share the client's testimonial..."
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{feedback.length}/500 characters</p>
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !imageUrl || !name || !role || !feedback}>
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials?.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.image_url} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/30"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    <CardDescription className="text-sm">{testimonial.role}</CardDescription>
                  </div>
                  <Badge variant={testimonial.status === 'active' ? 'default' : 'secondary'}>
                    {testimonial.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm line-clamp-3">"{testimonial.feedback}"</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(testimonial)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {testimonial.status === 'active' ? (
                    <Button variant="ghost" size="sm" onClick={() => softDeleteMutation.mutate(testimonial.id)}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Deactivate
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => reactivateMutation.mutate(testimonial.id)}>
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
