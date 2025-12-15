import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, RotateCcw, Clock, Loader2, Calendar } from 'lucide-react';

const categories = ['frontend', 'backend', 'ai-automation', 'education'] as const;
type Category = typeof categories[number];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface TimelineItem {
  id: string;
  year: string;
  month: string | null;
  title: string;
  description: string;
  skills: string[];
  category: string;
  project_link: string | null;
  icon: string | null;
  display_order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TimelineFormData {
  year: string;
  month: string;
  title: string;
  description: string;
  skills: string;
  category: Category;
  project_link: string;
  icon: string;
}

const SkillsTimelineManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [formData, setFormData] = useState<TimelineFormData>({
    year: new Date().getFullYear().toString(),
    month: '',
    title: '',
    description: '',
    skills: '',
    category: 'frontend',
    project_link: '',
    icon: '',
  });

  // Fetch all timeline items (including inactive for admin)
  const { data: timelineItems, isLoading } = useQuery({
    queryKey: ['admin-skills-timeline'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills_timeline')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as TimelineItem[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: TimelineFormData) => {
      const maxOrder = timelineItems?.reduce((max, item) => Math.max(max, item.display_order), 0) ?? 0;
      const skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
      
      const { error } = await supabase
        .from('skills_timeline')
        .insert({
          year: data.year,
          month: data.month || null,
          title: data.title,
          description: data.description,
          skills: skillsArray,
          category: data.category,
          project_link: data.project_link || null,
          icon: data.icon || null,
          display_order: maxOrder + 1,
          status: 'active',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills-timeline'] });
      queryClient.invalidateQueries({ queryKey: ['skills-timeline'] });
      toast.success('Timeline entry added successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to add entry: ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TimelineFormData }) => {
      const skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
      
      const { error } = await supabase
        .from('skills_timeline')
        .update({
          year: data.year,
          month: data.month || null,
          title: data.title,
          description: data.description,
          skills: skillsArray,
          category: data.category,
          project_link: data.project_link || null,
          icon: data.icon || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills-timeline'] });
      queryClient.invalidateQueries({ queryKey: ['skills-timeline'] });
      toast.success('Timeline entry updated successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update entry: ' + error.message);
    },
  });

  // Toggle status mutation (soft delete/restore)
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('skills_timeline')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills-timeline'] });
      queryClient.invalidateQueries({ queryKey: ['skills-timeline'] });
      toast.success(`Entry ${newStatus === 'active' ? 'restored' : 'deactivated'}`);
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear().toString(),
      month: '',
      title: '',
      description: '',
      skills: '',
      category: 'frontend',
      project_link: '',
      icon: '',
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: TimelineItem) => {
    setEditingItem(item);
    setFormData({
      year: item.year,
      month: item.month || '',
      title: item.title,
      description: item.description,
      skills: item.skills.join(', '),
      category: item.category as Category,
      project_link: item.project_link || '',
      icon: item.icon || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const categoryColors: Record<string, string> = {
    frontend: 'bg-blue-500/20 text-blue-400',
    backend: 'bg-green-500/20 text-green-400',
    'ai-automation': 'bg-purple-500/20 text-purple-400',
    education: 'bg-yellow-500/20 text-yellow-400',
  };

  const categoryLabels: Record<string, string> = {
    frontend: 'Frontend Growth',
    backend: 'Backend Growth',
    'ai-automation': 'AI & Automation',
    education: 'Education',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              Skills Timeline Manager
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your career journey and skill milestones
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Timeline Entry' : 'Add New Timeline Entry'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="2024"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select
                      value={formData.month}
                      onValueChange={(value) => setFormData({ ...formData, month: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific month</SelectItem>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Achievement or milestone title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: Category) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {categoryLabels[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what you achieved or learned..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated) *</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="React, TypeScript, Node.js"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_link">Project Link (optional)</Label>
                  <Input
                    id="project_link"
                    type="url"
                    value={formData.project_link}
                    onChange={(e) => setFormData({ ...formData, project_link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (optional)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Lucide icon name"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingItem ? 'Update' : 'Add'} Entry
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Timeline Items */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {timelineItems?.map((item) => (
              <Card 
                key={item.id} 
                className={item.status === 'inactive' ? 'opacity-60' : ''}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={categoryColors[item.category]}>
                          {categoryLabels[item.category]}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {item.month && `${item.month} `}{item.year}
                        </div>
                        {item.status === 'inactive' && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={item.status === 'active' ? 'destructive' : 'secondary'}
                        size="sm"
                        onClick={() => toggleStatusMutation.mutate({ 
                          id: item.id, 
                          status: item.status 
                        })}
                      >
                        {item.status === 'active' ? (
                          <Trash2 className="h-4 w-4" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">
                    {item.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1.5">
                    {item.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  {item.project_link && (
                    <a 
                      href={item.project_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm text-primary hover:underline"
                    >
                      View Project →
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {timelineItems?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No timeline entries found. Add your first milestone!
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SkillsTimelineManager;
