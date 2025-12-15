import { useState, useEffect, lazy, Suspense } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Eye, 
  Users, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  TrendingUp,
  Calendar,
  RefreshCw,
  Radio,
  MapPin,
  Loader2
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const VisitorMap = lazy(() => import('@/components/admin/VisitorMap'));

type DateRange = '7d' | '30d' | '90d';

const DEVICE_COLORS = {
  desktop: 'hsl(var(--primary))',
  mobile: 'hsl(var(--chart-2))',
  tablet: 'hsl(var(--chart-3))',
};

const BROWSER_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const Analytics = () => {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [isLive, setIsLive] = useState(true);
  const queryClient = useQueryClient();

  const getDaysFromRange = (range: DateRange): number => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!isLive) return;

    const channel = supabase
      .channel('analytics-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_events'
        },
        () => {
          // Invalidate and refetch analytics data when new event arrives
          queryClient.invalidateQueries({ queryKey: ['analytics', dateRange] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLive, dateRange, queryClient]);

  const { data: analyticsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      const days = getDaysFromRange(dateRange);
      const startDate = startOfDay(subDays(new Date(), days));
      const endDate = endOfDay(new Date());

      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Process data for charts
  const processedData = (() => {
    if (!analyticsData?.length) {
      return {
        totalViews: 0,
        uniquePages: 0,
        uniqueCountries: 0,
        deviceBreakdown: [],
        browserBreakdown: [],
        countryBreakdown: [],
        visitorLocations: [],
        pageViews: [],
        dailyViews: [],
        recentViews: [],
      };
    }

    // Total views
    const totalViews = analyticsData.length;

    // Unique pages
    const uniquePages = new Set(analyticsData.map(e => e.page_path)).size;

    // Device breakdown
    const deviceCounts: Record<string, number> = {};
    analyticsData.forEach(event => {
      const deviceType = (event.event_data as any)?.device_type || 'unknown';
      deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
    });
    const deviceBreakdown = Object.entries(deviceCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: DEVICE_COLORS[name as keyof typeof DEVICE_COLORS] || 'hsl(var(--muted))',
    }));

    // Browser breakdown
    const browserCounts: Record<string, number> = {};
    analyticsData.forEach(event => {
      const browser = (event.event_data as any)?.browser || 'Unknown';
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });
    const browserBreakdown = Object.entries(browserCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], index) => ({
        name,
        value,
        color: BROWSER_COLORS[index] || 'hsl(var(--muted))',
      }));

    // Page views breakdown
    const pageCounts: Record<string, number> = {};
    analyticsData.forEach(event => {
      const path = event.page_path || '/';
      pageCounts[path] = (pageCounts[path] || 0) + 1;
    });
    const pageViews = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }));

    // Daily views trend
    const dailyCounts: Record<string, number> = {};
    analyticsData.forEach(event => {
      const date = format(new Date(event.created_at!), 'MMM dd');
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    const dailyViews = Object.entries(dailyCounts)
      .reverse()
      .map(([date, views]) => ({ date, views }));

    // Country breakdown
    const countryCounts: Record<string, number> = {};
    analyticsData.forEach(event => {
      const country = (event.event_data as any)?.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    const countryBreakdown = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));

    // Unique countries
    const uniqueCountries = new Set(
      analyticsData
        .map(e => (e.event_data as any)?.country)
        .filter(c => c && c !== 'Unknown')
    ).size;

    // Visitor locations for map
    const locationMap = new Map<string, { country: string; countryCode: string; city: string; lat: number; lon: number; count: number }>();
    analyticsData.forEach(event => {
      const data = event.event_data as any;
      const lat = data?.lat;
      const lon = data?.lon;
      if (lat && lon && lat !== 0 && lon !== 0) {
        const key = `${data.city}-${data.country}`;
        const existing = locationMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          locationMap.set(key, {
            country: data.country || 'Unknown',
            countryCode: data.country_code || 'XX',
            city: data.city || 'Unknown',
            lat,
            lon,
            count: 1
          });
        }
      }
    });
    const visitorLocations = Array.from(locationMap.values());

    // Recent views (last 20)
    const recentViews = analyticsData.slice(0, 20).map(event => ({
      id: event.id,
      page: event.page_path || '/',
      device: (event.event_data as any)?.device_type || 'unknown',
      browser: (event.event_data as any)?.browser || 'Unknown',
      country: (event.event_data as any)?.country || 'Unknown',
      city: (event.event_data as any)?.city || 'Unknown',
      referrer: event.referrer || 'Direct',
      time: event.created_at,
    }));

    return {
      totalViews,
      uniquePages,
      uniqueCountries,
      deviceBreakdown,
      browserBreakdown,
      countryBreakdown,
      visitorLocations,
      pageViews,
      dailyViews,
      recentViews,
    };
  })();

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Track visitor activity and page views</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant={isLive ? "default" : "outline"} 
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className="gap-2"
            >
              <Radio className={`h-3 w-3 ${isLive ? 'animate-pulse' : ''}`} />
              {isLive ? 'Live' : 'Paused'}
            </Button>
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processedData.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                Last {getDaysFromRange(dateRange)} days
                {isLive && <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Pages</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processedData.uniquePages}</div>
              <p className="text-xs text-muted-foreground">Pages visited</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Desktop Views</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {processedData.deviceBreakdown.find(d => d.name === 'Desktop')?.value || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {processedData.totalViews > 0 
                  ? `${Math.round(((processedData.deviceBreakdown.find(d => d.name === 'Desktop')?.value || 0) / processedData.totalViews) * 100)}% of traffic`
                  : 'No data'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Countries</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processedData.uniqueCountries}</div>
              <p className="text-xs text-muted-foreground">Unique locations</p>
            </CardContent>
          </Card>
        </div>

        {/* Geographic Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Visitor Locations
            </CardTitle>
            <CardDescription>Geographic distribution of visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <Suspense fallback={
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }>
                <VisitorMap locations={processedData.visitorLocations} />
              </Suspense>
            </div>
          </CardContent>
        </Card>

        {/* Country Breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Countries</CardTitle>
              <CardDescription>Visitors by country</CardDescription>
            </CardHeader>
            <CardContent>
              {processedData.countryBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {processedData.countryBreakdown.map((item, index) => (
                    <div key={item.country} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-sm w-6">{index + 1}.</span>
                        <span className="font-medium">{item.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ 
                              width: `${(item.count / processedData.totalViews) * 100}%` 
                            }} 
                          />
                        </div>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No geographic data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mobile Views</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {processedData.deviceBreakdown.find(d => d.name === 'Mobile')?.value || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {processedData.totalViews > 0 
                  ? `${Math.round(((processedData.deviceBreakdown.find(d => d.name === 'Mobile')?.value || 0) / processedData.totalViews) * 100)}% of traffic`
                  : 'No data'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Daily Views Trend */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Views Over Time
              </CardTitle>
              <CardDescription>Daily page view trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {processedData.dailyViews.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processedData.dailyViews}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="views" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Visitors by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {processedData.deviceBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={processedData.deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {processedData.deviceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Browser Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Browser Breakdown</CardTitle>
              <CardDescription>Top browsers used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {processedData.browserBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedData.browserBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {processedData.browserBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Pages & Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>Most visited pages</CardDescription>
            </CardHeader>
            <CardContent>
              {processedData.pageViews.length > 0 ? (
                <div className="space-y-4">
                  {processedData.pageViews.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-sm w-6">{index + 1}.</span>
                        <span className="font-mono text-sm truncate max-w-[200px]">{page.page}</span>
                      </div>
                      <Badge variant="secondary">{page.views} views</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No page view data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest page views</CardDescription>
            </CardHeader>
            <CardContent>
              {processedData.recentViews.length > 0 ? (
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedData.recentViews.map((view) => (
                        <TableRow key={view.id}>
                          <TableCell className="font-mono text-xs truncate max-w-[120px]">
                            {view.page}
                          </TableCell>
                          <TableCell className="text-xs">
                            {view.city !== 'Unknown' ? `${view.city}, ${view.country}` : view.country}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getDeviceIcon(view.device)}
                              <span className="text-xs capitalize">{view.device}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {view.time ? format(new Date(view.time), 'MMM dd, HH:mm') : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
