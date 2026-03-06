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
import { Plus, Pencil, XCircle, CheckCircle, Trash2, ImageIcon } from 'lucide-react';

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
  
  // New case study fields
  const [problemStatement, setProblemStatement] = useState('');
  const [solutionDescription, setSolutionDescription] = useState('');
  const [architectureSummary, setArchitectureSummary] = useState('');
  const [securityFeatures, setSecurityFeatures] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [resultsImpact, setResultsImpact] = useState('');
  const [categoryTags, setCategoryTags] = useState('');
  const [slug, setSlug] = useState('');

  // Project images state
  const [projectImages, setProjectImages] = useState<any[]>([]);
  const [newCaption, setNewCaption] = useState('');

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
    // Reset new fields
    setProblemStatement('');
    setSolutionDescription('');
    setArchitectureSummary('');
    setSecurityFeatures('');
    setKeyFeatures('');
    setResultsImpact('');
    setCategoryTags('');
    setSlug('');
  };

  const handleEdit = async (project: any) => {
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
    setProblemStatement(project.problem_statement || '');
    setSolutionDescription(project.solution_description || '');
    setArchitectureSummary(project.architecture_summary || '');
    setSecurityFeatures(project.security_features?.join(', ') || '');
    setKeyFeatures(project.key_features?.join(', ') || '');
    setResultsImpact(project.results_impact || '');
    setCategoryTags(project.category_tags?.join(', ') || '');
    setSlug(project.slug || '');
    // Load project images
    const { data: imgs } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', project.id)
      .order('display_order', { ascending: true });
    setProjectImages(imgs || []);
    setIsOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const techArray = technologies.split(',').map((t) => t.trim()).filter(Boolean);
      const securityArray = securityFeatures.split(',').map((s) => s.trim()).filter(Boolean);
      const featuresArray = keyFeatures.split(',').map((f) => f.trim()).filter(Boolean);
      const tagsArray = categoryTags.split(',').map((t) => t.trim()).filter(Boolean);
      const displayOrder = editingId
        ? (projects?.find((p) => p.id === editingId)?.display_order || 0)
        : (projects?.length || 0) + 1;

      const projectData = {
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
        problem_statement: problemStatement,
        solution_description: solutionDescription,
        architecture_summary: architectureSummary,
        security_features: securityArray,
        key_features: featuresArray,
        results_impact: resultsImpact,
        category_tags: tagsArray,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
      };

      if (editingId) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').insert({
          ...projectData,
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

                {/* Case Study Section */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-4">Case Study Details (Optional)</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Problem Statement</Label>
                      <Textarea 
                        value={problemStatement} 
                        onChange={(e) => setProblemStatement(e.target.value)} 
                        rows={3}
                        placeholder="What business/user pain point does this project solve?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Solution Description</Label>
                      <Textarea 
                        value={solutionDescription} 
                        onChange={(e) => setSolutionDescription(e.target.value)} 
                        rows={3}
                        placeholder="What did you build to solve this problem?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Architecture Summary</Label>
                      <Textarea 
                        value={architectureSummary} 
                        onChange={(e) => setArchitectureSummary(e.target.value)} 
                        rows={3}
                        placeholder="FE: React, BE: Node.js, DB: PostgreSQL, Auth: Supabase Auth..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Security Features (comma separated)</Label>
                        <Input 
                          value={securityFeatures} 
                          onChange={(e) => setSecurityFeatures(e.target.value)} 
                          placeholder="RBAC, RLS, Rate Limiting, Input Validation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category Tags (comma separated)</Label>
                        <Input 
                          value={categoryTags} 
                          onChange={(e) => setCategoryTags(e.target.value)} 
                          placeholder="Payments, Dashboard, Auth, APIs"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Key Features (comma separated)</Label>
                      <Textarea 
                        value={keyFeatures} 
                        onChange={(e) => setKeyFeatures(e.target.value)} 
                        rows={2}
                        placeholder="Real-time updates, Multi-tenancy, Payment processing, PDF export"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Results / Impact</Label>
                      <Textarea 
                        value={resultsImpact} 
                        onChange={(e) => setResultsImpact(e.target.value)} 
                        rows={2}
                        placeholder="Quantitative metrics or qualitative outcomes achieved"
                      />
                    </div>
                  </div>
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
                {/* Project Screenshots Section */}
                {editingId && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Project Screenshots
                    </h3>

                    {/* Existing images */}
                    {projectImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {projectImages.map((img) => (
                          <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border">
                            <img src={img.image_url} alt={img.caption || 'Screenshot'} className="w-full h-32 object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={async () => {
                                  const { error } = await supabase.from('project_images').delete().eq('id', img.id);
                                  if (error) { toast.error('Failed to delete'); return; }
                                  setProjectImages(prev => prev.filter(i => i.id !== img.id));
                                  toast.success('Image removed');
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {img.caption && (
                              <p className="text-xs text-muted-foreground p-1 truncate">{img.caption}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload new screenshot */}
                    <div className="space-y-2">
                      <Input
                        value={newCaption}
                        onChange={(e) => setNewCaption(e.target.value)}
                        placeholder="Caption (optional)"
                      />
                      <ImageUploader
                        bucket="project-images"
                        onUploadComplete={async (url) => {
                          if (!url || !editingId) return;
                          const nextOrder = projectImages.length + 1;
                          const { data, error } = await supabase.from('project_images').insert({
                            project_id: editingId,
                            image_url: url,
                            caption: newCaption || null,
                            display_order: nextOrder,
                          }).select().single();
                          if (error) { toast.error('Failed to save image'); return; }
                          setProjectImages(prev => [...prev, data]);
                          setNewCaption('');
                          toast.success('Screenshot added');
                        }}
                      />
                    </div>
                  </div>
                )}

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
