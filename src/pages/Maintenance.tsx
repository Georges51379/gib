import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Construction } from 'lucide-react';

export default function Maintenance() {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      return data;
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <Construction className="h-24 w-24 mx-auto text-primary animate-pulse" />
        <h1 className="text-4xl md:text-6xl font-bold">Under Maintenance</h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          {settings?.maintenance_message ||
            'We are currently performing maintenance. Please check back soon.'}
        </p>
        <p className="text-sm text-muted-foreground">
          Thank you for your patience!
        </p>
      </div>
    </div>
  );
}
