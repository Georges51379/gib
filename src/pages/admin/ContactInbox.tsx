import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, MailOpen, Archive, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ContactInbox() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('unread');

  const { data: messages } = useQuery({
    queryKey: ['contact-messages', activeTab],
    queryFn: async () => {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab === 'unread') {
        query = query.eq('status', 'unread');
      } else if (activeTab === 'archived') {
        query = query.eq('status', 'archived');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status, read_at: status === 'read' ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      toast.success('Message deleted');
    },
  });

  const MessageCard = ({ message }: { message: any }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {message.name}
              {message.status === 'unread' && (
                <Badge variant="default">New</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {message.email} • {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {message.status === 'unread' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateStatusMutation.mutate({ id: message.id, status: 'read' })}
                title="Mark as read"
              >
                <MailOpen className="h-4 w-4" />
              </Button>
            )}
            {message.status === 'read' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateStatusMutation.mutate({ id: message.id, status: 'unread' })}
                title="Mark as unread"
              >
                <Mail className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                updateStatusMutation.mutate({
                  id: message.id,
                  status: message.status === 'archived' ? 'read' : 'archived',
                })
              }
              title={message.status === 'archived' ? 'Unarchive' : 'Archive'}
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteMutation.mutate(message.id)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{message.message}</p>
        {message.ip_address && (
          <p className="text-xs text-muted-foreground mt-4">
            IP: {message.ip_address}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground mt-2">View and manage contact form submissions</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="unread">
              Unread
              {messages && activeTab === 'unread' && messages.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {messages.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {messages && messages.length > 0 ? (
              messages.map((message) => <MessageCard key={message.id} message={message} />)
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No messages found
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
