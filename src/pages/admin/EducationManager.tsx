import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, XCircle, CheckCircle } from 'lucide-react';
import DOMPurify from 'dompurify';

export default function EducationManager() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [year, setYear] = useState('');
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');

  const { data: education } = useQuery({
    queryKey: ['education-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setYear('');
    setInstitution('');
    setDegree('');
    setDescription('');
    setTechnologies('');
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setYear(item.year);
    setInstitution(item.institution);
    setDegree(item.degree);
    setDescription(item.description);
    setTechnologies(item.technologies?.join(', ') || '');
    setIsOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const techArray = technologies.split(',').map((t) => t.trim()).filter(Boolean);
      const displayOrder = editingId
        ? (education?.find((e) => e.id === editingId)?.display_order || 0)
        : (education?.length || 0) + 1;

      if (editingId) {
        const { error } = await supabase
          .from('education')
          .update({
            year,
            institution,
            degree,
            description,
            technologies: techArray,
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('education').insert({
          year,
          institution,
          degree,
          description,
          technologies: techArray,
          display_order: displayOrder,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-list'] });
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
      const { error } = await supabase.from('education').update({ status: 'inactive' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-list'] });
      toast.success('Education entry deactivated successfully');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('education').update({ status: 'active' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-list'] });
      toast.success('Education entry reactivated successfully');
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Education</h1>
            <p className="text-muted-foreground mt-2">Manage your education and certifications</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Education</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2020-2024" />
                </div>
                <div className="space-y-2">
                  <Label>Institution</Label>
                  <Input value={institution} onChange={(e) => setInstitution(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Degree / Certification</Label>
                  <Input value={degree} onChange={(e) => setDegree(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <RichTextEditor content={description} onChange={setDescription} />
                </div>
                <div className="space-y-2">
                  <Label>Technologies (comma separated)</Label>
                  <Input
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    placeholder="React, Node.js, Python"
                  />
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {education?.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle>{item.degree}</CardTitle>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>{item.institution} • {item.year}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {item.status === 'active' ? (
                      <Button variant="ghost" size="icon" onClick={() => softDeleteMutation.mutate(item.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => reactivateMutation.mutate(item.id)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(item.description, {
                    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'],
                    ALLOWED_ATTR: ['href', 'target', 'rel']
                  }) 
                }} />
                {item.technologies && item.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {item.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
