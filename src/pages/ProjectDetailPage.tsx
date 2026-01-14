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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import DOMPurify from "dompurify";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Github,
  Clock,
  Users,
  Target,
  Lightbulb,
  Shield,
  Layers,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

// Helper: sanitize rich text safely
const sanitizeHtml = (html: string) => DOMPurify.sanitize(html || "");

// Helper: extract plain-ish description for SEO (avoid dumping HTML into meta)
const stripTags = (html: string) =>
  (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch project by slug or id
  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", slug],
    queryFn: async () => {
      // Try slug first
      let { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .eq("status", "active")
        .single();

      // If not found by slug, try by id
      if (error || !data) {
        const result = await supabase
          .from("projects")
          .select("*")
          .eq("id", slug)
          .eq("status", "active")
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch project images
  const { data: images } = useQuery({
    queryKey: ["project-images", project?.id],
    queryFn: async () => {
      if (!project?.id) return [];
      const { data, error } = await supabase
        .from("project_images")
        .select("*")
        .eq("project_id", project.id)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!project?.id,
  });

  // Fetch all projects for navigation
  const { data: allProjects } = useQuery({
    queryKey: ["all-projects-nav"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, slug, title")
        .eq("status", "active")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Find prev/next projects
  const currentIndex =
    allProjects?.findIndex((p) => p.id === project?.id || p.slug === slug) ?? -1;
  const prevProject = currentIndex > 0 ? allProjects?.[currentIndex - 1] : null;
  const nextProject =
    currentIndex < (allProjects?.length ?? 0) - 1
      ? allProjects?.[currentIndex + 1]
      : null;

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const canonical = project
    ? `${siteUrl}/projects/${project.slug || project.id}`
    : `${siteUrl}/projects/${slug || ""}`;

  // ✅ Make sure overview is shown (this was missing!)
  const overviewHtmlRaw =
    project?.detailed_description ||
    project?.full_description ||
    project?.description ||
    "";

  // ✅ challenges/solutions (fallback to problem statement)
  const challengesHtmlRaw =
    project?.challenges || project?.problem_statement || "";

  // Short description might be plain text OR HTML from editor → render safely as HTML
  const shortDescHtml = sanitizeHtml(project?.short_description || "");

  const overviewHtml = sanitizeHtml(overviewHtmlRaw);
  const challengesHtml = sanitizeHtml(challengesHtmlRaw);

  const title = project
    ? `${project.title} | Case Study - Georges Boutros`
    : "Project | Georges Boutros";

  const seoDescription =
    stripTags(project?.short_description || "") ||
    stripTags(overviewHtmlRaw) ||
    "View the full case study for this project.";

  const schema = project
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CreativeWork",
            name: project.title,
            description: seoDescription,
            url: canonical,
            image: project.thumbnail_url,
            author: { "@type": "Person", name: "Georges Boutros" },
            dateCreated: project.created_at,
            keywords: Array.isArray(project.technologies)
              ? project.technologies.join(", ")
              : undefined,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Projects",
                item: `${siteUrl}/projects`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: project.title,
                item: canonical,
              },
            ],
          },
        ],
      }
    : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16 container-custom">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/projects">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
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
        title={title}
        description={seoDescription}
        canonical={canonical}
        image={project.thumbnail_url}
        type="article"
        schema={schema}
      />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-custom">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button asChild variant="ghost" size="sm">
              <Link to="/projects">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.category_tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {project.title}
                </h1>

                {/* ✅ render short_description as safe HTML (works for plain text too) */}
                {project.short_description ? (
                  <div
                    className="text-lg text-muted-foreground mb-6 prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: shortDescHtml }}
                  />
                ) : null}

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {project.duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{project.duration}</span>
                    </div>
                  )}
                  {project.role && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{project.role}</span>
                    </div>
                  )}
                  {project.team_size && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Team: {project.team_size}</span>
                    </div>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4">
                  {project.live_url && (
                    <Button asChild>
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                  {project.github_url && (
                    <Button asChild variant="outline">
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        View Code
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="aspect-video rounded-lg overflow-hidden shadow-xl">
                <img
                  src={project.thumbnail_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>

          {/* ✅ Overview / Detailed Description (THIS WAS MISSING) */}
          {(overviewHtml || project.short_description) && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-12"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: overviewHtml || shortDescHtml,
                    }}
                  />
                </CardContent>
              </Card>
            </motion.section>
          )}

          {/* Case Study Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Case Study</h2>
            <Accordion
              type="multiple"
              defaultValue={["problem", "solution", "features"]}
              className="space-y-4"
            >
              {project.problem_statement && (
                <AccordionItem value="problem" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Problem & Challenge</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-2 pb-4 whitespace-pre-line">
                    {project.problem_statement}
                  </AccordionContent>
                </AccordionItem>
              )}

              {project.solution_description && (
                <AccordionItem value="solution" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Solution</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-2 pb-4 whitespace-pre-line">
                    {project.solution_description}
                  </AccordionContent>
                </AccordionItem>
              )}

              {project.architecture_summary && (
                <AccordionItem
                  value="architecture"
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Architecture</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-2 pb-4 whitespace-pre-line">
                    {project.architecture_summary}
                  </AccordionContent>
                </AccordionItem>
              )}

              {project.security_features && project.security_features.length > 0 && (
                <AccordionItem value="security" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Security & Reliability</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {project.security_features.map((feature: string, i: number) => (
                        <Badge key={i} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {project.key_features && project.key_features.length > 0 && (
                <AccordionItem value="features" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Key Features</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <ul className="space-y-2">
                      {project.key_features.map((feature: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-muted-foreground"
                        >
                          <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-1" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {project.results_impact && (
                <AccordionItem value="results" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Results & Impact</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-2 pb-4 whitespace-pre-line">
                    {project.results_impact}
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </motion.div>

          {/* ✅ Challenges & Solutions (THIS WAS MISSING) */}
          {challengesHtml && stripTags(challengesHtml).length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-12"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Challenges & Solutions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: challengesHtml }}
                  />
                </CardContent>
              </Card>
            </motion.section>
          )}

          {/* Tech Stack */}
          {project.technologies && project.technologies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Tech Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: string) => (
                      <Badge key={tech} variant="secondary" className="text-sm">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Gallery */}
          {images && images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold mb-6">Gallery</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {images.map((image: any) => (
                  <div key={image.id} className="rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={image.image_url}
                      alt={image.caption || project.title}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                    {image.caption && (
                      <p className="text-sm text-muted-foreground p-3 bg-muted/50">
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-between items-center pt-8 border-t"
          >
            {prevProject ? (
              <Button asChild variant="outline">
                <Link to={`/projects/${prevProject.slug || prevProject.id}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {prevProject.title}
                </Link>
              </Button>
            ) : (
              <div />
            )}
            {nextProject ? (
              <Button asChild variant="outline">
                <Link to={`/projects/${nextProject.slug || nextProject.id}`}>
                  {nextProject.title}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <div />
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default ProjectDetailPage;
