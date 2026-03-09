import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LifeBuoy, CheckCircle, Eye, Trash2, Phone, Mail, Building } from 'lucide-react';
import { format } from 'date-fns';

const urgencyColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-primary/20 text-primary',
  high: 'bg-orange-500/20 text-orange-600',
  critical: 'bg-destructive/20 text-destructive',
};

export default function RescueInbox() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');

  const { data: requests } = useQuery({
    queryKey: ['rescue-requests', activeTab],
    queryFn: async () => {
      let query = supabase
        .from('rescue_requests' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('rescue_requests' as any)
        .update({ status } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rescue-requests'] });
      toast.success('Status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rescue_requests' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rescue-requests'] });
      toast.success('Request deleted');
    },
  });

  const RequestCard = ({ request }: { request: any }) => {
    const problems = Array.isArray(request.problems) ? request.problems : [];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 flex-wrap">
                {request.name}
                <Badge variant="outline" className={urgencyColors[request.urgency] || ''}>
                  {request.urgency?.toUpperCase()}
                </Badge>
                {request.status === 'pending' && <Badge>New</Badge>}
              </CardTitle>
              <CardDescription className="flex items-center gap-3 mt-1 flex-wrap">
                {request.email && (
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{request.email}</span>
                )}
                {request.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{request.phone}</span>
                )}
                {request.company && (
                  <span className="flex items-center gap-1"><Building className="w-3 h-3" />{request.company}</span>
                )}
                <span>• {format(new Date(request.created_at), 'MMM dd, yyyy HH:mm')}</span>
              </CardDescription>
            </div>
            <div className="flex gap-1">
              {request.status === 'pending' && (
                <Button variant="ghost" size="icon" onClick={() => updateStatusMutation.mutate({ id: request.id, status: 'reviewed' })} title="Mark as reviewed">
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {request.status !== 'resolved' && (
                <Button variant="ghost" size="icon" onClick={() => updateStatusMutation.mutate({ id: request.id, status: 'resolved' })} title="Mark as resolved">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(request.id)} title="Delete">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {problems.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Problems:</h4>
              {problems.map((p: any, i: number) => (
                <div key={i} className="border border-border rounded-md p-3">
                  <p className="font-medium">{p.title || `Problem #${i + 1}`}</p>
                  {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
                </div>
              ))}
            </div>
          )}
          {request.additional_notes && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Additional Notes:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.additional_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-primary" />
            Rescue Inbox
          </h1>
          <p className="text-muted-foreground mt-2">Review and manage rescue requests from clients</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              {requests && activeTab === 'pending' && requests.length > 0 && (
                <Badge variant="secondary" className="ml-2">{requests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {requests && requests.length > 0 ? (
              requests.map((req) => <RequestCard key={req.id} request={req} />)
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No rescue requests found
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
