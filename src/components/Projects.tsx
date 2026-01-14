import { Link } from "react-router-dom";
import { ExternalLink, Github, ArrowRight, User, Users, UserCheck } from "lucide-react";
import { Button } from "./ui/button";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import { staggerContainer, staggerItem, fadeInUp } from "@/utils/animations";
import { LazyImage } from "./LazyImage";
import { ProjectFilter } from "./ProjectFilter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

// Role icon mapping
const getRoleIcon = (role: string) => {
  const lowerRole = role?.toLowerCase() || "";
  if (lowerRole.includes("lead") || lowerRole.includes("senior")) return UserCheck;
  if (lowerRole.includes("team") || lowerRole.includes("contributor")) return Users;
  return User;
};

// Role display mapping
const getRoleDisplay = (role: string): string => {
  if (!role) return "Solo Developer";
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes("lead")) return "Lead";
  if (lowerRole.includes("senior")) return "Senior";
  if (lowerRole.includes("team") || lowerRole.includes("contributor")) return "Team";
  if (lowerRole.includes("solo") || lowerRole.includes("full")) return "Solo";
  return "Solo";
};

// Simple slug fallback if DB slug is missing
const slugify = (value: string) =>
  (value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const Projects = () => {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Web", "Data", "AI", "Cloud", "Mobile"];

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "active")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return projects;

    return projects.filter((project: any) => project.category === activeCategory);
  }, [projects, activeCategory]);

  if (isLoading) {
    return (
      <section id="projects" className="section-padding bg-[hsl(var(--section-bg))]" ref={ref as any}>
        <div className="container-custom space-y-8">
          <Skeleton className="h-12 w-64 mx-auto" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="section-padding bg-[hsl(var(--section-bg))]" ref={ref as any}>
      <div className="container-custom">
        <motion.div
          className="text-center mb-16"
          initial={fadeInUp.initial}
          animate={isInView ? fadeInUp.animate : fadeInUp.initial}
          transition={{ duration: 0.6 }}
        >
          <h2 className="gradient-text mb-4">Featured Projects</h2>
          <motion.div
            className="w-20 h-1 gradient-bg mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto">
            Explore some of my recent work showcasing expertise in full-stack development and data engineering
          </p>
        </motion.div>

        <ProjectFilter categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

        <motion.div
          className="grid md:grid-cols-2 gap-8 mb-12"
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
        >
          {filteredProjects.map((project: any) => {
            const RoleIcon = getRoleIcon(project.role);

            // IMPORTANT: Link to your SEO route (/projects/:slug)
            const slug = project.slug || slugify(project.title);
            const projectHref = `/projects/${slug}`;

            const categoryTags: string[] = Array.isArray(project.category_tags) ? project.category_tags : [];

            const technologies: string[] = Array.isArray(project.technologies) ? project.technologies : [];

            return (
              <motion.div
                key={project.id}
                variants={staggerItem}
                whileHover={{ y: -12 }}
                transition={{ duration: 0.3 }}
                className="group rounded-2xl overflow-hidden bg-card border border-border shadow-lg hover:border-primary/50 hover:shadow-[0_0_30px_rgba(255,215,0,0.15)]"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
                  <LazyImage
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  <motion.div
                    className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 0, x: 0 } : { opacity: 0, x: 20 }}
                  >
                    {project.live_url && (
                      <motion.a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-smooth"
                        aria-label="View live demo"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ExternalLink className="h-5 w-5 text-white" />
                      </motion.a>
                    )}

                    {project.github_url && (
                      <motion.a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-smooth"
                        aria-label="View on GitHub"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Github className="h-5 w-5 text-white" />
                      </motion.a>
                    )}
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <h3 className="text-2xl font-bold">{project.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <RoleIcon className="h-3 w-3" />
                        {getRoleDisplay(project.role)}
                      </Badge>
                    </div>
                  </div>

                  {/* Category Tags */}
                  {categoryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {categoryTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs font-medium rounded bg-secondary/20 text-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                    {project.short_description}
                  </p>

                  {/* Technologies */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {technologies.slice(0, 5).map((tech) => (
                        <motion.span
                          key={tech}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                          whileHover={{ scale: 1.1 }}
                        >
                          {tech}
                        </motion.span>
                      ))}
                      {technologies.length > 5 && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                          +{technologies.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Duration */}
                  {project.duration && <p className="text-sm text-muted-foreground mb-4">{project.duration}</p>}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link to={projectHref} className="flex-1">
                      <Button variant="default" className="w-full gradient-bg group/btn">
                        View Case Study
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>

                    {project.live_url && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-primary/30 hover:border-primary hover:bg-primary/10"
                        asChild
                      >
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer" aria-label="Live Demo">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
