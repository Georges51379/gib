import { useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SEO } from "@/components/SEO";
import { AnimatedCounterSection } from "@/components/AnimatedCounter";
import { TestimonialsMarquee } from "@/components/TestimonialsMarquee";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, User, DollarSign, Wrench, Star, BookOpen, Clock, LifeBuoy } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const faqItems = [
  {
    question: "Who is Georges Boutros?",
    answer: "Georges Boutros is a Full Stack Developer and Data Engineer based in Lebanon. He specializes in building modern, scalable web applications using React, Node.js, Python, TypeScript, AWS, PostgreSQL, and Supabase."
  },
  {
    question: "What services does Georges Boutros offer?",
    answer: "Georges Boutros offers full-stack web development, data engineering, cloud architecture (AWS), database design (PostgreSQL, Supabase), API development, and enterprise software solutions. He works with clients worldwide from Lebanon."
  },
  {
    question: "Where is Georges Boutros based?",
    answer: "Georges Boutros is based in Lebanon and available for remote work worldwide. He provides web development and data engineering services to clients across the Middle East and globally."
  },
  {
    question: "How can I hire Georges Boutros?",
    answer: "You can hire Georges Boutros by visiting the contact page at dev-handover-tool.lovable.app/contact or by emailing boutros.georges513@gmail.com. He is available for freelance projects, contract work, and long-term engagements."
  }
];

const siteUrl = 'https://gib-two.vercel.app';

const HomePage = () => {
  const { data: heroData } = useQuery({
    queryKey: ['hero'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_section')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: featuredProjects } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, slug, title, short_description, thumbnail_url, technologies, category_tags, featured')
        .eq('status', 'active')
        .eq('featured', true)
        .order('display_order', { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: latestPosts } = useQuery({
    queryKey: ['latest-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, cover_image_url, created_at, reading_time_minutes, tags, author')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: pricingPlans } = useQuery({
    queryKey: ['pricing-preview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('id, name, price, period, description, highlighted')
        .eq('status', 'active')
        .order('display_order', { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const title = heroData?.name ? `${heroData.name} | Full Stack Developer & Data Engineer | React, Supabase, Enterprise Systems, Payment API Integration` : "Georges Boutros | Full Stack Developer & Data Engineer | React, Supabase, Enterprise Systems, Payment API Integration";
  const description = heroData?.description || "Georges Boutros — Full Stack Developer & Data Engineer based in Lebanon. Building modern, data-driven, and scalable web applications with React, Node.js, Python, AWS, and PostgreSQL.";

  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "name": heroData?.name || "Georges Boutros",
        "jobTitle": heroData?.subtitle || "Full Stack Developer & Data Engineer",
        "url": siteUrl,
        "image": `${siteUrl}/logo-GIB.png`,
        "description": description,
        "nationality": { "@type": "Country", "name": "Lebanon" },
        "address": { "@type": "PostalAddress", "addressCountry": "LB", "addressLocality": "Lebanon" },
        "knowsAbout": ["React", "Node.js", "Python", "TypeScript", "AWS", "PostgreSQL", "Supabase", "Data Engineering"],
        "sameAs": [
          "https://github.com/Georges51379",
          "https://linkedin.com/in/georges-boutros-534960211"
        ]
      },
      {
        "@type": "WebSite",
        "name": "Georges Boutros Portfolio",
        "url": siteUrl,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${siteUrl}/projects?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  }), [heroData?.name, heroData?.subtitle, description]);

  return (
    <div className="min-h-screen">
      <SEO 
        title={title}
        description={description}
        canonical={siteUrl}
        image="/logo-GIB.png"
        type="website"
        schema={schema}
        keywords="Georges Boutros, Full Stack Developer, Data Engineer, Lebanon, Beirut, Lebanese developer, software developer Lebanon, React developer Lebanon, Node.js, Python, TypeScript, AWS, PostgreSQL, Supabase, Web Development, hire developer Lebanon, freelance developer Lebanon"
        faqItems={faqItems}
        breadcrumbs={[{ name: "Home", url: siteUrl }]}
      />
      <Navbar />
      <main id="main-content">
        <Hero />

        {/* Animated Stats */}
        <AnimatedCounterSection
          stats={[
            { end: 15, suffix: "+", label: "Projects Delivered" },
            { end: 50000, suffix: "+", label: "Lines of Code" },
            { end: 4, suffix: "+", label: "Years Experience" },
            { end: 10, suffix: "+", label: "Happy Clients" },
          ]}
        />

        {/* Featured Projects Preview */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="section-padding bg-muted/30"
        >
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-primary" />
                <h2 className="text-3xl font-bold">Featured Projects</h2>
              </div>
              <Button asChild variant="outline">
                <Link to="/projects" className="flex items-center gap-2">
                  View All Projects
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects?.map((project) => (
                <Card key={project.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={project.thumbnail_url} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <span className="text-xs text-muted-foreground">Featured</span>
                    </div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.short_description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.category_tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <Button asChild size="sm" className="w-full">
                      <Link to={`/projects/${project.slug || project.id}`}>View Case Study</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.section>

        {/* About Preview */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="section-padding"
        >
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-primary" />
                <h2 className="text-3xl font-bold">About Me</h2>
              </div>
              <Button asChild variant="outline">
                <Link to="/about" className="flex items-center gap-2">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <Card className="p-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                I'm a Full-Stack Developer and Data Engineer based in Lebanon with a passion for building secure, 
                scalable web applications. With expertise in React, Node.js, Python, and cloud technologies, 
                I help businesses transform their ideas into production-ready solutions.
              </p>
            </Card>
          </div>
        </motion.section>

        {/* Services Preview */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="section-padding bg-muted/30"
        >
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-primary" />
                <h2 className="text-3xl font-bold">Services & Pricing</h2>
              </div>
              <Button asChild variant="outline">
                <Link to="/services" className="flex items-center gap-2">
                  View All Plans
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {pricingPlans?.map((plan) => (
                <Card key={plan.id} className={`${plan.highlighted ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-primary">{plan.price}<span className="text-sm text-muted-foreground">/{plan.period}</span></div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Latest Blog Posts */}
        {latestPosts && latestPosts.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            className="section-padding"
          >
            <div className="container-custom">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <h2 className="text-3xl font-bold">Latest Articles</h2>
                </div>
                <Button asChild variant="outline">
                  <Link to="/blog" className="flex items-center gap-2">
                    View All Articles
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestPosts.map((post) => (
                  <Card key={post.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
                        {post.author && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.author}
                          </span>
                        )}
                        <span>{format(new Date(post.created_at!), 'MMM dd, yyyy')}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.reading_time_minutes} min read
                        </span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                      <Button asChild size="sm" variant="outline" className="w-full">
                        <Link to={`/blog/${post.slug || post.id}`}>Read More</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Quick Rescue */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="section-padding bg-destructive/5"
        >
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <LifeBuoy className="w-6 h-6 text-destructive" />
                <h2 className="text-3xl font-bold">Quick Rescue</h2>
              </div>
              <Button asChild variant="outline">
                <Link to="/rescue" className="flex items-center gap-2">
                  Get Help Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <Card className="p-6">
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Facing a technical challenge? Submit your problem and I'll review it and get back to you with a solution plan. Fast response for urgent issues.
              </p>
              <Button asChild variant="destructive">
                <Link to="/rescue">Submit a Rescue Request</Link>
              </Button>
            </Card>
          </div>
        </motion.section>

        {/* Dev Tools Preview */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="section-padding bg-muted/30"
        >
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Wrench className="w-6 h-6 text-primary" />
                <h2 className="text-3xl font-bold">Developer Tools</h2>
              </div>
              <Button asChild variant="outline">
                <Link to="/dev-tools" className="flex items-center gap-2">
                  Explore Tools
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <Card className="p-6">
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Free, client-side developer utilities including JSON formatter, Base64 encoder/decoder, 
                UUID generator, regex tester, and more. All tools run locally in your browser — no data sent to servers.
              </p>
              <Button asChild>
                <Link to="/dev-tools">Try Dev Tools</Link>
              </Button>
            </Card>
          </div>
        </motion.section>

        {/* Testimonials Marquee */}
        <TestimonialsMarquee />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default HomePage;
