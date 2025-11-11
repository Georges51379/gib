import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching active projects for sitemap...');

    // Fetch active projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, updated_at, title, thumbnail_url')
      .eq('status', 'active')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    console.log(`Found ${projects?.length || 0} active projects`);

    // Get site URL from request origin or use default
    const siteUrl = new URL(req.url).origin.replace(/\/$/, '');
    const today = new Date().toISOString().split('T')[0];

    // Define image type
    interface ImageInfo {
      loc: string;
      title: string;
      caption: string;
    }

    // Build sitemap URLs
    const urls: Array<{
      loc: string;
      lastmod: string;
      changefreq: string;
      priority: number;
      images: ImageInfo[];
    }> = [
      {
        loc: siteUrl,
        lastmod: today,
        changefreq: 'weekly',
        priority: 1.0,
        images: []
      },
      {
        loc: `${siteUrl}/#about`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.8,
        images: []
      },
      {
        loc: `${siteUrl}/#education`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
        images: []
      },
      {
        loc: `${siteUrl}/#projects`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.9,
        images: []
      },
      {
        loc: `${siteUrl}/#pricing`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
        images: []
      },
      {
        loc: `${siteUrl}/#testimonials`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
        images: []
      },
      {
        loc: `${siteUrl}/#contact`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
        images: []
      }
    ];

    // Add project detail pages with image sitemap
    if (projects && projects.length > 0) {
      projects.forEach(project => {
        const images: ImageInfo[] = [];
        if (project.thumbnail_url) {
          images.push({
            loc: project.thumbnail_url,
            title: project.title,
            caption: `${project.title} project thumbnail`
          });
        }

        urls.push({
          loc: `${siteUrl}/project/${project.id}`,
          lastmod: project.updated_at 
            ? new Date(project.updated_at).toISOString().split('T')[0] 
            : today,
          changefreq: 'monthly',
          priority: 0.85,
          images
        });
      });
    }

    // Generate XML sitemap with image sitemap support
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>${url.images.length > 0 ? `
${url.images.map(img => `    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:title>${img.title}</image:title>
      <image:caption>${img.caption}</image:caption>
    </image:image>`).join('\n')}` : ''}
  </url>`).join('\n')}
</urlset>`;

    console.log('Sitemap generated successfully');

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
