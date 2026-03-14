import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, Calendar, Star, BookOpen, ArrowRight, User } from "lucide-react";
import { format } from "date-fns";

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

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('status', 'active')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as unknown as BlogPost[];
    },
  });

  const allTags = useMemo(() => {
    if (!posts) return [];
    const tagSet = new Set<string>();
    posts.forEach(p => p.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter(post => {
      const matchesSearch = searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = tagFilter === "all" || post.tags?.includes(tagFilter);
      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, tagFilter]);

  const featuredPosts = filteredPosts.filter(p => p.featured);
  const regularPosts = filteredPosts.filter(p => !p.featured);

  const siteUrl = 'https://georgesbuilds.dev';

  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Georges Boutros Blog",
    "description": "Web development, data engineering, and software insights from Lebanon",
    "url": `${siteUrl}/blog`,
    "author": {
      "@type": "Person",
      "name": "Georges Boutros",
      "url": siteUrl,
      "address": { "@type": "PostalAddress", "addressCountry": "LB" }
    },
    "blogPost": posts?.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "url": `${siteUrl}/blog/${post.slug || post.id}`,
      "image": post.cover_image_url,
      "datePublished": post.created_at,
      "dateModified": post.updated_at,
      "author": { "@type": "Person", "name": post.author || "Georges Boutros" }
    })) || []
  };

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Blog", url: `${siteUrl}/blog` }
  ];

  const BlogCard = ({ post, featured = false }: { post: BlogPost; featured?: boolean }) => (
    <Card className={`group h-full overflow-hidden hover:shadow-xl transition-all duration-300 ${featured ? 'border-primary/20' : ''}`}>
      <div className="aspect-video overflow-hidden relative">
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-primary-foreground">
              <Star className="w-3 h-3 mr-1 fill-current" /> Featured
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
          {post.author && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {post.author}
            </span>
          )}
          {post.created_at && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(post.created_at), 'MMM dd, yyyy')}
            </span>
          )}
          {post.reading_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.reading_time_minutes} min read
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        <Button asChild size="sm" variant={featured ? "default" : "outline"} className="w-full">
          <Link to={`/blog/${post.slug || post.id}`}>
            Read More
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      <SEO
        title="Blog | Georges Boutros - Web Development & Data Engineering Insights"
        description="Read articles on web development, data engineering, React, Node.js, and software best practices by Georges Boutros, a developer based in Lebanon."
        canonical={`${siteUrl}/blog`}
        image="/logo-GIB.png"
        schema={schema}
        keywords="Georges Boutros blog, web development blog, data engineering, Lebanon developer blog, React tutorials, software developer Lebanon"
        breadcrumbs={breadcrumbs}
      />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-custom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">
                My <span className="gradient-text">Blog</span>
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Insights on web development, data engineering, and building scalable applications.
            </p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-10"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={tagFilter === "all" ? "default" : "outline"}
                onClick={() => setTagFilter("all")}
              >
                All
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  size="sm"
                  variant={tagFilter === tag ? "default" : "outline"}
                  onClick={() => setTagFilter(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
          )}

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                Featured Articles
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <BlogCard post={post} featured />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts */}
          {regularPosts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">All Articles</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <BlogCard post={post} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {filteredPosts.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">No articles found.</p>
              <p className="text-sm text-muted-foreground">Check back soon for new content!</p>
              {searchQuery && (
                <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setTagFilter("all"); }}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default BlogPage;
