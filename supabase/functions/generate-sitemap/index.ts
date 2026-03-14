import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

const SITE_URL = 'https://georgesbuilds.dev';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Allow overriding siteUrl via query param
    const url = new URL(req.url);
    const siteUrl = (url.searchParams.get('siteUrl') || SITE_URL).replace(/\/$/, '');
    const today = new Date().toISOString().split('T')[0];

    // Fetch active projects with slugs
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, slug, updated_at, title, thumbnail_url')
      .eq('status', 'active')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    interface ImageInfo {
      loc: string;
      title: string;
      caption: string;
    }

    interface SitemapUrl {
      loc: string;
      lastmod: string;
      changefreq: string;
      priority: number;
      images: ImageInfo[];
    }

    // Static pages with real routes
    const urls: SitemapUrl[] = [
      { loc: siteUrl, lastmod: today, changefreq: 'weekly', priority: 1.0, images: [] },
      { loc: `${siteUrl}/about`, lastmod: today, changefreq: 'weekly', priority: 0.8, images: [] },
      { loc: `${siteUrl}/projects`, lastmod: today, changefreq: 'weekly', priority: 0.9, images: [] },
      { loc: `${siteUrl}/blog`, lastmod: today, changefreq: 'weekly', priority: 0.9, images: [] },
      { loc: `${siteUrl}/services`, lastmod: today, changefreq: 'monthly', priority: 0.8, images: [] },
      { loc: `${siteUrl}/contact`, lastmod: today, changefreq: 'monthly', priority: 0.7, images: [] },
      { loc: `${siteUrl}/rescue`, lastmod: today, changefreq: 'monthly', priority: 0.6, images: [] },
      { loc: `${siteUrl}/dev-tools`, lastmod: today, changefreq: 'monthly', priority: 0.7, images: [] },
    ];

    // Add project detail pages using slug
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

        const projectPath = project.slug || project.id;
        urls.push({
          loc: `${siteUrl}/projects/${projectPath}`,
          lastmod: project.updated_at 
            ? new Date(project.updated_at).toISOString().split('T')[0] 
            : today,
          changefreq: 'monthly',
          priority: 0.85,
          images
        });
      });
    }

    // Fetch active blog posts with slugs
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('id, slug, updated_at, title, cover_image_url')
      .eq('status', 'active')
      .order('display_order', { ascending: true });

    if (blogError) {
      console.error('Error fetching blog posts:', blogError);
    }

    if (blogPosts && blogPosts.length > 0) {
      blogPosts.forEach(post => {
        const images: ImageInfo[] = [];
        if (post.cover_image_url) {
          images.push({
            loc: post.cover_image_url,
            title: post.title,
            caption: `${post.title} blog post cover`
          });
        }
        const postPath = post.slug || post.id;
        urls.push({
          loc: `${siteUrl}/blog/${postPath}`,
          lastmod: post.updated_at
            ? new Date(post.updated_at).toISOString().split('T')[0]
            : today,
          changefreq: 'weekly',
          priority: 0.8,
          images
        });
      });
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${u.images.length > 0 ? `
${u.images.map(img => `    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:title>${img.title}</image:title>
      <image:caption>${img.caption}</image:caption>
    </image:image>`).join('\n')}` : ''}
  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, { headers: corsHeaders, status: 200 });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
