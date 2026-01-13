import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github, Clock, Code2, Calendar, User, Briefcase, ArrowRight, Target, Lightbulb, Shield, Layers, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { TechBadge } from "@/components/TechBadge";
import { SectionDivider } from "@/components/SectionDivider";
import { motion } from "framer-motion";
import { fadeInUp, fadeInLeft, fadeInRight } from "@/utils/animations";
import { LazyImage } from "@/components/LazyImage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "dompurify";
import { SEO } from "@/components/SEO";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: projectImages = [] } = useQuery({
    queryKey: ['project-images', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_images')
        .select('*')
        .eq('project_id', id)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: relatedProjects = [] } = useQuery({
    queryKey: ['related-projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .neq('id', id)
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!project,
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-24">
          <section className="section-padding">
            <div className="container-custom space-y-8">
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sanitizedDescription = DOMPurify.sanitize(project.detailed_description || project.short_description);
  const sanitizedShortDescription = DOMPurify.sanitize(project.short_description || '');

  const siteUrl = window.location.origin;
  const projectUrl = `${siteUrl}/project/${project.id}`;
  const title = `${project.title} - Georges Boutros | Full-Stack Developer`;
  const description = project.short_description || project.title;

  // Structured data for the project
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": project.title,
        "description": description,
        "applicationCategory": "WebApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "screenshot": [project.thumbnail_url, ...projectImages.map(img => img.image_url)],
        "author": {
          "@type": "Person",
          "name": "Georges Boutros"
        },
        "datePublished": project.created_at,
        "url": project.live_url || projectUrl
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@id": siteUrl,
              "name": "Home"
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@id": `${siteUrl}/#projects`,
              "name": "Projects"
            }
          },
          {
            "@type": "ListItem",
            "position": 3,
            "item": {
              "@id": projectUrl,
              "name": project.title
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <SEO 
        title={title}
        description={description}
        canonical={projectUrl}
        image={project.thumbnail_url}
        type="article"
        schema={schema}
      />
      <Navbar />
      <BackToTop />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="section-padding bg-[hsl(var(--section-bg))] relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="container-custom relative z-10">
            {/* Breadcrumb Navigation */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/">Home</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/#projects">Projects</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{project.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ duration: 0.6 }}>
              {/* Project Status Badge */}
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Badge variant="secondary" className="text-base px-4 py-1.5">
                  {project.featured ? "Featured Project" : "Portfolio Project"}
                </Badge>
              </motion.div>

              {/* Main Title */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 gradient-text tracking-tight leading-tight">
                {project.title}
              </h1>
              
              {/* Description */}
              <div 
                className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-4xl leading-relaxed prose prose-lg prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizedShortDescription }}
              />

              {/* Project Metadata Row */}
              <div className="flex flex-wrap items-center gap-6 mb-10 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-base font-medium">{project.duration}</span>
                </div>
                {project.role && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <span className="text-base font-medium">{project.role}</span>
                  </div>
                )}
                {project.team_size && (
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <span className="text-base font-medium">{project.team_size}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-16">
                {project.live_url && (
                  <motion.a 
                    href={project.live_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="gradient-bg text-white text-base px-8 py-6 relative overflow-hidden group">
                      <span className="relative z-10 flex items-center">
                        <ExternalLink className="mr-2 h-5 w-5" />
                        View Live Demo
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-hover to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </motion.a>
                )}
                {project.github_url && (
                  <motion.a 
                    href={project.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" variant="outline" className="text-base px-8 py-6 border-primary/30 hover:border-primary hover:bg-primary/10 relative overflow-hidden group">
                      <span className="relative z-10 flex items-center">
                        <Github className="mr-2 h-5 w-5" />
                        View on GitHub
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </motion.a>
                )}
                <Link to="/#projects">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="ghost" className="text-base px-8 py-6 hover:bg-primary/10">
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back to Projects
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* Enhanced Info Cards */}
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div 
                  {...fadeInLeft} 
                  transition={{ duration: 0.6, delay: 0.5 }} 
                  className="group p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border-2 border-border hover:border-primary/50 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
                  <Clock className="h-10 w-10 text-primary mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-2xl font-bold mb-3 relative z-10">Project Duration</h3>
                  <p className="text-xl text-muted-foreground relative z-10">{project.duration}</p>
                </motion.div>
                
                <motion.div 
                  {...fadeInRight} 
                  transition={{ duration: 0.6, delay: 0.6 }} 
                  className="group p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border-2 border-border hover:border-primary/50 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors duration-500" />
                  <Code2 className="h-10 w-10 text-primary mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-2xl font-bold mb-4 relative z-10">Tech Stack</h3>
                  <div className="flex flex-wrap gap-3 relative z-10">
                    {(project.technologies || []).map((tech, index) => (
                      <motion.div
                        key={tech}
                        whileHover={{ y: -3, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TechBadge technology={tech} index={index} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Banner Image */}
        <section className="container-custom my-24">
          <motion.div 
            {...fadeInUp} 
            transition={{ duration: 0.8, delay: 0.3 }} 
            className="group rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500 relative"
            whileHover={{ scale: 1.01 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <LazyImage 
              src={project.thumbnail_url} 
              alt={project.title} 
              className="w-full h-[600px] lg:h-[700px] object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          </motion.div>
        </section>

        {/* Detailed Description with Professional Typography */}
        <section className="section-padding">
          <div className="container-custom">
            <motion.div 
              {...fadeInUp} 
              transition={{ duration: 0.6, delay: 0.4 }}
              className="project-prose"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          </div>
        </section>

        <SectionDivider />

        {/* Case Study Sections */}
        {(project.problem_statement || project.solution_description || project.architecture_summary || 
          (project.security_features && project.security_features.length > 0) ||
          (project.key_features && project.key_features.length > 0) || project.results_impact) && (
          <section className="section-padding">
            <div className="container-custom">
              <motion.div 
                {...fadeInUp} 
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Case Study</h2>
                <motion.div 
                  className="w-24 h-1.5 gradient-bg mx-auto rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </motion.div>

              <div className="max-w-4xl mx-auto">
                <Accordion type="single" collapsible className="space-y-4">
                  {/* Problem Statement */}
                  {project.problem_statement && (
                    <AccordionItem value="problem" className="border border-border rounded-2xl px-6 bg-card">
                      <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
                        <div className="flex items-center gap-3">
                          <Target className="h-6 w-6 text-primary" />
                          <span>Problem & Challenge</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-lg text-muted-foreground pb-6 leading-relaxed">
                        {project.problem_statement}
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Solution */}
                  {project.solution_description && (
                    <AccordionItem value="solution" className="border border-border rounded-2xl px-6 bg-card">
                      <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
                        <div className="flex items-center gap-3">
                          <Lightbulb className="h-6 w-6 text-primary" />
                          <span>Solution</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-lg text-muted-foreground pb-6 leading-relaxed">
                        {project.solution_description}
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Architecture */}
                  {project.architecture_summary && (
                    <AccordionItem value="architecture" className="border border-border rounded-2xl px-6 bg-card">
                      <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
                        <div className="flex items-center gap-3">
                          <Layers className="h-6 w-6 text-primary" />
                          <span>Architecture</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-lg text-muted-foreground pb-6 leading-relaxed whitespace-pre-line">
                        {project.architecture_summary}
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Security Features */}
                  {project.security_features && project.security_features.length > 0 && (
                    <AccordionItem value="security" className="border border-border rounded-2xl px-6 bg-card">
                      <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
                        <div className="flex items-center gap-3">
                          <Shield className="h-6 w-6 text-primary" />
                          <span>Security & Reliability</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <div className="flex flex-wrap gap-3">
                          {project.security_features.map((feature: string) => (
                            <Badge key={feature} variant="outline" className="text-base px-4 py-2">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Key Features */}
                  {project.key_features && project.key_features.length > 0 && (
                    <AccordionItem value="features" className="border border-border rounded-2xl px-6 bg-card">
                      <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-6 w-6 text-primary" />
                          <span>Key Features</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <ul className="space-y-3">
                          {project.key_features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start gap-3 text-lg text-muted-foreground">
                              <span className="mt-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Results & Impact */}
                  {project.results_impact && (
                    <AccordionItem value="results" className="border border-border rounded-2xl px-6 bg-card">
                      <AccordionTrigger className="text-xl font-semibold hover:no-underline py-6">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-6 w-6 text-primary" />
                          <span>Results & Impact</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-lg text-muted-foreground pb-6 leading-relaxed">
                        {project.results_impact}
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>
            </div>
          </section>
        )}

        <SectionDivider />

        {/* Challenges & Solutions - Enhanced */}
        <section className="section-padding bg-[hsl(var(--section-bg))] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container-custom relative z-10">
            <motion.div 
              {...fadeInUp} 
              transition={{ duration: 0.6 }} 
              className="max-w-5xl mx-auto"
            >
              {/* Section Header */}
              <div className="text-center mb-16">
                <motion.h2 
                  className="text-4xl md:text-5xl font-bold mb-6 gradient-text"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  Challenges & Solutions
                </motion.h2>
                <motion.div 
                  className="w-24 h-1.5 gradient-bg mx-auto rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>

              {/* Content Card */}
              <motion.div 
                className="p-10 md:p-12 rounded-3xl bg-gradient-to-br from-card via-card/95 to-card/90 border-2 border-primary/20 shadow-2xl backdrop-blur-sm hover:border-primary/40 hover:shadow-[0_0_40px_rgba(255,215,0,0.15)] transition-all duration-300"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1.5 h-3 w-3 rounded-full bg-gradient-to-r from-primary to-secondary flex-shrink-0" />
                    <div 
                      className="text-lg md:text-xl text-muted-foreground leading-loose prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(project.challenges || '') 
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <SectionDivider />

        {/* Image Gallery - Enhanced */}
        {projectImages.length > 0 && (
          <section className="section-padding">
            <div className="container-custom">
              <motion.div 
                {...fadeInUp} 
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Project Gallery</h2>
                <motion.div 
                  className="w-24 h-1.5 gradient-bg mx-auto rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
                <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
                  Explore detailed screenshots and visual highlights of the project
                </p>
              </motion.div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {projectImages.map((image: any, index: number) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -12, scale: 1.02 }}
                    className="group rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_0_40px_rgba(255,215,0,0.15)] transition-all duration-500 relative border border-border hover:border-primary/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <LazyImage
                      src={image.image_url}
                      alt={image.caption || `${project.title} screenshot ${index + 1}`}
                      className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="text-white font-semibold text-lg">{image.caption || `Screenshot ${index + 1}`}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        <SectionDivider />

        {/* Related Projects - Enhanced */}
        <section className="section-padding bg-[hsl(var(--section-bg))]">
          <div className="container-custom">
            <motion.div 
              {...fadeInUp} 
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Explore More Projects</h2>
              <motion.div 
                className="w-24 h-1.5 gradient-bg mx-auto rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
                Discover other projects from my portfolio
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedProjects
                .map((relatedProject: any, index: number) => (
                  <motion.div
                    key={relatedProject.id}
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
                  >
                    <Link to={`/project/${relatedProject.id}`} className="group block">
                      <motion.div 
                        className="rounded-2xl overflow-hidden bg-card border border-border shadow-lg hover:border-primary/50 hover:shadow-[0_0_30px_rgba(255,215,0,0.15)]"
                        whileHover={{ y: -12, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
                          <LazyImage
                            src={relatedProject.thumbnail_url}
                            alt={relatedProject.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
                              <ArrowRight className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                            {relatedProject.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {relatedProject.short_description}
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                  ))}
            </div>
          </div>
        </section>
        
        {/* Next/Previous Project Navigation */}
        {relatedProjects.length > 0 && (
          <section className="section-padding border-t border-border">
            <div className="container-custom">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <motion.div
                  whileHover={{ x: -5 }}
                  transition={{ duration: 0.2 }}
                  className="w-full sm:w-auto"
                >
                  <Link to={`/project/${relatedProjects[0]?.id}`} className="block">
                    <Button variant="outline" size="lg" className="group border-primary/30 hover:border-primary hover:bg-primary/10 w-full sm:w-auto justify-start">
                      <ArrowLeft className="mr-2 h-5 w-5 flex-shrink-0 transition-transform group-hover:-translate-x-1" />
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">Previous</p>
                        <p className="font-semibold truncate">{relatedProjects[0]?.title}</p>
                      </div>
                    </Button>
                  </Link>
                </motion.div>
                
                {relatedProjects[1] && (
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                    className="w-full sm:w-auto"
                  >
                    <Link to={`/project/${relatedProjects[1]?.id}`} className="block">
                      <Button variant="outline" size="lg" className="group border-primary/30 hover:border-primary hover:bg-primary/10 w-full sm:w-auto justify-end sm:justify-start">
                        <div className="text-left sm:text-right min-w-0 flex-1 order-1 sm:order-none">
                          <p className="text-xs text-muted-foreground">Next</p>
                          <p className="font-semibold truncate">{relatedProjects[1]?.title}</p>
                        </div>
                        <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-1 order-2 sm:order-none" />
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default ProjectDetail;
