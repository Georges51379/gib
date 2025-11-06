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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, XCircle, CheckCircle } from 'lucide-react';

export default function ProjectsManager() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [role, setRole] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [challenges, setChallenges] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [category, setCategory] = useState('Web');

  const { data: projects } = useQuery({
    queryKey: ['projects-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setShortDescription('');
    setDetailedDescription('');
    setThumbnailUrl('');
    setDuration('');
    setRole('');
    setTeamSize('');
    setTechnologies('');
    setChallenges('');
    setLiveUrl('');
    setGithubUrl('');
    setFeatured(false);
    setCategory('Web');
  };

  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setTitle(project.title);
    setShortDescription(project.short_description);
    setDetailedDescription(project.detailed_description);
    setThumbnailUrl(project.thumbnail_url);
    setDuration(project.duration);
    setRole(project.role || '');
    setTeamSize(project.team_size || '');
    setTechnologies(project.technologies?.join(', ') || '');
    setChallenges(project.challenges);
    setLiveUrl(project.live_url || '');
    setGithubUrl(project.github_url || '');
    setFeatured(project.featured);
    setCategory(project.category || 'Web');
    setIsOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const techArray = technologies.split(',').map((t) => t.trim()).filter(Boolean);
      const displayOrder = editingId
        ? (projects?.find((p) => p.id === editingId)?.display_order || 0)
        : (projects?.length || 0) + 1;

      if (editingId) {
        const { error } = await supabase
          .from('projects')
          .update({
            title,
            short_description: shortDescription,
            detailed_description: detailedDescription,
            thumbnail_url: thumbnailUrl,
            duration,
            role,
            team_size: teamSize,
            technologies: techArray,
            challenges,
            live_url: liveUrl,
            github_url: githubUrl,
            featured,
            category,
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').insert({
          title,
          short_description: shortDescription,
          detailed_description: detailedDescription,
          thumbnail_url: thumbnailUrl,
          duration,
          role,
          team_size: teamSize,
          technologies: techArray,
          challenges,
          live_url: liveUrl,
          github_url: githubUrl,
          featured,
          category,
          display_order: displayOrder,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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
      const { error } = await supabase.from('projects').update({ status: 'inactive' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      toast.success('Project deactivated successfully');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').update({ status: 'active' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] });
      toast.success('Project reactivated successfully');
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-2">Manage your portfolio projects</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="6 months" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Short Description</Label>
                  <Textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Thumbnail Image</Label>
                  <ImageUploader bucket="project-images" onUploadComplete={setThumbnailUrl} currentImage={thumbnailUrl} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Full-Stack Developer" />
                  </div>
                  <div className="space-y-2">
                    <Label>Team Size</Label>
                    <Input value={teamSize} onChange={(e) => setTeamSize(e.target.value)} placeholder="5 people" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Technologies (comma separated)</Label>
                    <Input value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, Node.js, MongoDB" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web">Web</SelectItem>
                        <SelectItem value="Data">Data</SelectItem>
                        <SelectItem value="AI">AI</SelectItem>
                        <SelectItem value="Cloud">Cloud</SelectItem>
                        <SelectItem value="Mobile">Mobile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Detailed Description</Label>
                  <RichTextEditor content={detailedDescription} onChange={setDetailedDescription} />
                </div>
                <div className="space-y-2">
                  <Label>Challenges & Solutions</Label>
                  <RichTextEditor content={challenges} onChange={setChallenges} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Live URL</Label>
                    <Input value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={featured} onCheckedChange={setFeatured} />
                  <Label>Featured Project</Label>
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !thumbnailUrl}>
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <Card key={project.id}>
              <img src={project.thumbnail_url} alt={project.title} className="w-full h-48 object-cover" />
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>{project.title}</span>
                  <div className="flex gap-2">
                    {project.featured && <Badge>Featured</Badge>}
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>{project.short_description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {project.status === 'active' ? (
                    <Button variant="ghost" size="sm" onClick={() => softDeleteMutation.mutate(project.id)}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Deactivate
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => reactivateMutation.mutate(project.id)}>
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
