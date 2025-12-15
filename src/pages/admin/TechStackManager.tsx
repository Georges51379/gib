import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
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
import { Plus, Pencil, Trash2, RotateCcw, Code2, Loader2 } from 'lucide-react';

const categories = ['Frontend', 'Backend', 'Database', 'Cloud', 'AI', 'Tools', 'DevOps'] as const;
type Category = typeof categories[number];

interface TechItem {
  id: string;
  name: string;
  category: string;
  experience_level: number;
  description: string;
  icon: string | null;
  display_order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TechFormData {
  name: string;
  category: Category;
  experience_level: number;
  description: string;
  icon: string;
}

const TechStackManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TechItem | null>(null);
  const [formData, setFormData] = useState<TechFormData>({
    name: '',
    category: 'Frontend',
    experience_level: 50,
    description: '',
    icon: '',
  });

  // Fetch all tech stack items (including inactive for admin)
  const { data: techItems, isLoading } = useQuery({
    queryKey: ['admin-tech-stack'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tech_stack')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as TechItem[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: TechFormData) => {
      const maxOrder = techItems?.reduce((max, item) => Math.max(max, item.display_order), 0) ?? 0;
      const { error } = await supabase
        .from('tech_stack')
        .insert({
          ...data,
          icon: data.icon || null,
          display_order: maxOrder + 1,
          status: 'active',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tech-stack'] });
      queryClient.invalidateQueries({ queryKey: ['tech-stack'] });
      toast.success('Technology added successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to add technology: ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TechFormData> }) => {
      const { error } = await supabase
        .from('tech_stack')
        .update({
          ...data,
          icon: data.icon || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tech-stack'] });
      queryClient.invalidateQueries({ queryKey: ['tech-stack'] });
      toast.success('Technology updated successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update technology: ' + error.message);
    },
  });

  // Toggle status mutation (soft delete/restore)
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('tech_stack')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['admin-tech-stack'] });
      queryClient.invalidateQueries({ queryKey: ['tech-stack'] });
      toast.success(`Technology ${newStatus === 'active' ? 'restored' : 'deactivated'}`);
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Frontend',
      experience_level: 50,
      description: '',
      icon: '',
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: TechItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category as Category,
      experience_level: item.experience_level,
      description: item.description,
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
    Frontend: 'bg-blue-500/20 text-blue-400',
    Backend: 'bg-green-500/20 text-green-400',
    Database: 'bg-orange-500/20 text-orange-400',
    Cloud: 'bg-cyan-500/20 text-cyan-400',
    AI: 'bg-purple-500/20 text-purple-400',
    Tools: 'bg-yellow-500/20 text-yellow-400',
    DevOps: 'bg-red-500/20 text-red-400',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Code2 className="h-8 w-8 text-primary" />
              Tech Stack Manager
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your technology skills and expertise levels
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Technology
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Technology' : 'Add New Technology'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="React, Python, AWS..."
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
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Experience Level: {formData.experience_level}%</Label>
                  <Slider
                    value={[formData.experience_level]}
                    onValueChange={([value]) => setFormData({ ...formData, experience_level: value })}
                    max={100}
                    min={0}
                    step={5}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your experience with this technology..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (optional)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Lucide icon name or URL"
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
                    {editingItem ? 'Update' : 'Add'} Technology
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tech Stack Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {techItems?.map((item) => (
              <Card 
                key={item.id} 
                className={item.status === 'inactive' ? 'opacity-60' : ''}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={categoryColors[item.category]}>
                          {item.category}
                        </Badge>
                        {item.status === 'inactive' && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {item.experience_level}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-2">
                    {item.description}
                  </CardDescription>
                  <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.experience_level}%` }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
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
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {techItems?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No technologies found. Add your first one!
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TechStackManager;
