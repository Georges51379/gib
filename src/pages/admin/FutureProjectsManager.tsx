import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, XCircle, CheckCircle } from 'lucide-react';
import DOMPurify from 'dompurify';

export default function FutureProjectsManager() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectStatus, setProjectStatus] = useState<'Planning' | 'In Development'>('Planning');
  const [features, setFeatures] = useState('');
  const [iconName, setIconName] = useState('Lightbulb');

  const { data: projects } = useQuery({
    queryKey: ['future-projects-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('future_projects')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setProjectStatus('Planning');
    setFeatures('');
    setIconName('Lightbulb');
  };

  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setProjectStatus(project.project_status || 'Planning');
    setFeatures(project.features?.join('\n') || '');
    setIconName(project.icon_name);
    setIsOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const featuresArray = features.split('\n').map((f) => f.trim()).filter(Boolean);
      const displayOrder = editingId
        ? (projects?.find((p) => p.id === editingId)?.display_order || 0)
        : (projects?.length || 0) + 1;

      if (editingId) {
        const { error } = await supabase
          .from('future_projects')
          .update({
            title,
            description,
            project_status: projectStatus,
            features: featuresArray,
            icon_name: iconName,
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('future_projects').insert({
          title,
          description,
          project_status: projectStatus,
          status: 'active',
          features: featuresArray,
          icon_name: iconName,
          display_order: displayOrder,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['future-projects-list'] });
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
      const { error } = await supabase.from('future_projects').update({ status: 'inactive' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['future-projects-list'] });
      toast.success('Future project deactivated successfully');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('future_projects').update({ status: 'active' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['future-projects-list'] });
      toast.success('Future project reactivated successfully');
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Future Projects</h1>
            <p className="text-muted-foreground mt-2">Manage your upcoming project ideas</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Future Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Future Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <RichTextEditor content={description} onChange={setDescription} />
                </div>
                <div className="space-y-2">
                  <Label>Project Status</Label>
                  <Select value={projectStatus} onValueChange={(v: any) => setProjectStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="In Development">In Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Features (one per line)</Label>
                  <textarea
                    className="w-full min-h-[120px] px-3 py-2 border border-border rounded-lg"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon Name</Label>
                  <Input value={iconName} onChange={(e) => setIconName(e.target.value)} placeholder="Lightbulb" />
                  <p className="text-xs text-muted-foreground">Use any Lucide icon name</p>
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects?.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{project.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={project.project_status === 'Planning' ? 'secondary' : 'default'}>
                        {project.project_status}
                      </Badge>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {project.status === 'active' ? (
                      <Button variant="ghost" size="icon" onClick={() => softDeleteMutation.mutate(project.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => reactivateMutation.mutate(project.id)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(project.description, {
                    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'],
                    ALLOWED_ATTR: ['href', 'target', 'rel']
                  }) 
                }} />
                {project.features && project.features.length > 0 && (
                  <ul className="list-disc list-inside mt-4 space-y-1 text-sm">
                    {project.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
