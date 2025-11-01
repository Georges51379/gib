import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Mail, Folder, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const today = new Date();
      const thirtyDaysAgo = subDays(today, 30);

      const [
        { count: todayViews },
        { count: totalMessages },
        { count: unreadMessages },
        { count: totalProjects },
      ] = await Promise.all([
        supabase
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'page_view')
          .gte('created_at', format(today, 'yyyy-MM-dd')),
        supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'unread'),
        supabase
          .from('projects')
          .select('*', { count: 'exact', head: true }),
      ]);

      return {
        todayViews: todayViews || 0,
        totalMessages: totalMessages || 0,
        unreadMessages: unreadMessages || 0,
        totalProjects: totalProjects || 0,
      };
    },
  });

  const { data: chartData } = useQuery({
    queryKey: ['page-views-chart'],
    queryFn: async () => {
      const { data } = await supabase
        .from('analytics_events')
        .select('created_at')
        .eq('event_type', 'page_view')
        .gte('created_at', format(subDays(new Date(), 30), 'yyyy-MM-dd'))
        .order('created_at');

      const viewsByDay: Record<string, number> = {};
      data?.forEach((event) => {
        const day = format(new Date(event.created_at), 'MMM dd');
        viewsByDay[day] = (viewsByDay[day] || 0) + 1;
      });

      return Object.entries(viewsByDay).map(([date, views]) => ({ date, views }));
    },
  });

  const { data: recentMessages } = useQuery({
    queryKey: ['recent-messages'],
    queryFn: async () => {
      const { data } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data;
    },
  });

  const statCards = [
    {
      title: "Today's Page Views",
      value: stats?.todayViews || 0,
      icon: Eye,
      color: 'text-blue-500',
    },
    {
      title: 'Unread Messages',
      value: stats?.unreadMessages || 0,
      icon: Mail,
      color: 'text-green-500',
    },
    {
      title: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: Folder,
      color: 'text-purple-500',
    },
    {
      title: 'Total Messages',
      value: stats?.totalMessages || 0,
      icon: TrendingUp,
      color: 'text-orange-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's your site overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Page Views (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Contact Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages?.map((message) => (
                <div key={message.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{message.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), 'MMM dd, yyyy')}
                      </span>
                      {message.status === 'unread' && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{message.email}</p>
                    <p className="text-sm mt-1 truncate">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
