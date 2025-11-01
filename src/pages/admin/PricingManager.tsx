import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, XCircle, CheckCircle, GripVertical, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";

type PricingPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  display_order: number;
  status: string;
};

export default function PricingManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([""]);
  const [highlighted, setHighlighted] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(1);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as PricingPlan[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (plan: Omit<PricingPlan, 'id' | 'created_at' | 'updated_at'>) => {
      if (editingId) {
        const { error } = await supabase
          .from('pricing_plans')
          .update(plan)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pricing_plans')
          .insert([plan]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      toast({
        title: "Success",
        description: `Pricing plan ${editingId ? 'updated' : 'created'} successfully.`,
      });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pricing_plans').update({ status: 'inactive' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      toast({
        title: "Success",
        description: "Pricing plan deactivated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pricing_plans').update({ status: 'active' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      toast({
        title: "Success",
        description: "Pricing plan reactivated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setPeriod("");
    setDescription("");
    setFeatures([""]);
    setHighlighted(false);
    setDisplayOrder(plans.length + 1);
  };

  const openEditDialog = (plan: PricingPlan) => {
    setEditingId(plan.id);
    setName(plan.name);
    setPrice(plan.price);
    setPeriod(plan.period);
    setDescription(plan.description);
    setFeatures(plan.features.length > 0 ? plan.features : [""]);
    setHighlighted(plan.highlighted);
    setDisplayOrder(plan.display_order);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setDisplayOrder(plans.length + 1);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !price.trim() || !period.trim() || !description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const validFeatures = features.filter(f => f.trim() !== "");
    if (validFeatures.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one feature.",
        variant: "destructive",
      });
      return;
    }

    const existingPlan = editingId ? plans.find(p => p.id === editingId) : null;

    saveMutation.mutate({
      name,
      price,
      period,
      description,
      features: validFeatures,
      highlighted,
      display_order: displayOrder,
      status: existingPlan?.status || 'active',
    });
  };

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pricing Plans</h1>
          <p className="text-muted-foreground">Manage your pricing plans and features</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Pricing Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Add'} Pricing Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Professional"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    placeholder="e.g., $7,500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Period *</Label>
                  <Input
                    id="period"
                    placeholder="e.g., per project"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the plan"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Features *</Label>
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Enter feature"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                    />
                    {features.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="highlighted"
                    checked={highlighted}
                    onCheckedChange={setHighlighted}
                  />
                  <Label htmlFor="highlighted">Highlighted (Most Popular)</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save Plan"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.highlighted ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="flex gap-2">
                      {plan.highlighted && (
                        <Badge>Most Popular</Badge>
                      )}
                      <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                        {plan.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="mt-1">{plan.description}</CardDescription>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(plan)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {plan.status === 'active' ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => softDeleteMutation.mutate(plan.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => reactivateMutation.mutate(plan.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-2">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2">Features ({plan.features.length}):</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx}>• {feature}</li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-xs italic">+ {plan.features.length - 3} more...</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No pricing plans yet.</p>
          <Button onClick={openNewDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Plan
          </Button>
        </div>
      )}
    </AdminLayout>
  );
}
