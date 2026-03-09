import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Clock, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import DOMPurify from "dompurify";
import { BlogTableOfContents } from "@/components/BlogTableOfContents";

interface BlogPost {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string;
  content: string;
  cover_image_url: string;
  tags: string[] | null;
  featured: boolean | null;
  status: string | null;
  display_order: number;
  author: string | null;
  reading_time_minutes: number | null;
  created_at: string | null;
  updated_at: string | null;
}

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      let { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        const result = await supabase
          .from('blog_posts' as any)
          .select('*')
          .eq('id', slug)
          .eq('status', 'active')
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data as unknown as BlogPost;
    },
  });

  const { data: allPosts } = useQuery({
    queryKey: ['blog-posts-nav'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('id, slug, title')
        .eq('status', 'active')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as unknown as { id: string; slug: string | null; title: string }[];
    },
  });

  const currentIndex = allPosts?.findIndex(p => p.id === post?.id || p.slug === slug) ?? -1;
  const prevPost = currentIndex > 0 ? allPosts?.[currentIndex - 1] : null;
  const nextPost = currentIndex < (allPosts?.length ?? 0) - 1 ? allPosts?.[currentIndex + 1] : null;

  const siteUrl = 'https://gib-two.vercel.app';

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const wordCount = post ? stripHtml(post.content).split(/\s+/).filter(Boolean).length : 0;
  const articleSection = post?.tags?.[0] || 'Technology';

  const schema = post ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "url": `${siteUrl}/blog/${post.slug || post.id}`,
    "image": post.cover_image_url,
    "datePublished": post.created_at,
    "dateModified": post.updated_at,
    "wordCount": wordCount,
    "articleSection": articleSection,
    "articleBody": stripHtml(post.content).substring(0, 500),
    "inLanguage": "en",
    "author": {
      "@type": "Person",
      "name": post.author || "Georges Boutros",
      "url": siteUrl,
      "address": { "@type": "PostalAddress", "addressCountry": "LB", "addressLocality": "Lebanon" }
    },
    "publisher": {
      "@type": "Person",
      "name": "Georges Boutros",
      "url": siteUrl
    },
    "keywords": [...(post.tags || []), "Georges Boutros", "Lebanon"].join(", "),
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${siteUrl}/blog/${post.slug || post.id}` }
  } : undefined;

  const breadcrumbs = post ? [
    { name: "Home", url: siteUrl },
    { name: "Blog", url: `${siteUrl}/blog` },
    { name: post.title, url: `${siteUrl}/blog/${post.slug || post.id}` }
  ] : undefined;

  const postKeywords = post
    ? [...(post.tags || []), "Georges Boutros", "Lebanon", "web development blog", "software developer"].join(", ")
    : "blog, Georges Boutros, Lebanon";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16 container-custom">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
        title={`${post.title} | Blog - Georges Boutros`}
        description={post.excerpt}
        canonical={`${siteUrl}/blog/${post.slug || post.id}`}
        image={post.cover_image_url}
        type="article"
        schema={schema}
        keywords={postKeywords}
        breadcrumbs={breadcrumbs}
        publishedTime={post.created_at || undefined}
        modifiedTime={post.updated_at || undefined}
        articleSection={articleSection}
      />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-custom">
          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <Button asChild variant="ghost" size="sm">
              <Link to="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </motion.div>

          {/* Hero */}
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Cover Image */}
            <div className="aspect-[21/9] rounded-xl overflow-hidden mb-8 shadow-xl">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title & Meta */}
            <div className="max-w-4xl mx-auto">
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}

              <h1 className="text-3xl md:text-5xl font-bold mb-6">{post.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author || "Georges Boutros"}
                </span>
                {post.created_at && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(post.created_at), 'MMMM dd, yyyy')}
                  </span>
                )}
                {post.reading_time_minutes && (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {post.reading_time_minutes} min read
                  </span>
                )}
              </div>

              {/* Content with TOC */}
              <div className="relative">
                <div className="xl:flex xl:gap-8">
                  <div
                    className="project-prose flex-1 min-w-0"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                  />
                  <div className="w-56 shrink-0">
                    <BlogTableOfContents contentHtml={post.content} />
                  </div>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between items-center pt-8 mt-12 border-t max-w-4xl mx-auto"
          >
            {prevPost ? (
              <Button asChild variant="outline">
                <Link to={`/blog/${prevPost.slug || prevPost.id}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {prevPost.title}
                </Link>
              </Button>
            ) : <div />}
            {nextPost ? (
              <Button asChild variant="outline">
                <Link to={`/blog/${nextPost.slug || nextPost.id}`}>
                  {nextPost.title}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : <div />}
          </motion.div>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default BlogDetailPage;
