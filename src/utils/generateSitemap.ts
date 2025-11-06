import { supabase } from '@/integrations/supabase/client';

export const generateSitemap = async () => {
  const siteUrl = 'https://yoursite.com'; // Update with actual domain
  
  const { data: projects } = await supabase
    .from('projects')
    .select('id, updated_at, title, thumbnail_url')
    .eq('status', 'active')
    .order('display_order', { ascending: true });

  const urls = [
    {
      loc: siteUrl,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 1.0
    },
    {
      loc: `${siteUrl}/#about`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: `${siteUrl}/#projects`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.9
    },
    {
      loc: `${siteUrl}/#contact`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: 0.7
    }
  ];

  if (projects) {
    projects.forEach(project => {
      urls.push({
        loc: `${siteUrl}/project/${project.id}`,
        lastmod: project.updated_at ? new Date(project.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.9
      });
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};
