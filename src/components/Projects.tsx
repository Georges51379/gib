import { Link } from "react-router-dom";
import { ExternalLink, Github, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { staggerContainer, staggerItem, fadeInUp } from "@/utils/animations";
import { LazyImage } from "./LazyImage";
import { ProjectFilter } from "./ProjectFilter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import DOMPurify from "dompurify";

export const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Web", "Data", "AI", "Cloud"];

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section id="projects" className="section-padding bg-[hsl(var(--section-bg))]" ref={ref}>
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
    <section id="projects" className="section-padding bg-[hsl(var(--section-bg))]" ref={ref}>
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

        <ProjectFilter 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <motion.div 
          className="grid md:grid-cols-2 gap-8 mb-12"
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
        >
          {projects.map((project, index) => (
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold">{project.title}</h3>
                  <span className="text-sm text-muted-foreground">{project.duration}</span>
                </div>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">{project.short_description}</p>
                
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Technologies:</p>
                  <div className="flex flex-wrap gap-2">
                    {(project.technologies || []).map((tech) => (
                      <motion.span
                        key={tech}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                        whileHover={{ scale: 1.1 }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold mb-1">Challenges:</p>
                  <div
                    className="prose prose-invert max-w-none text-sm text-muted-foreground leading-relaxed [&>p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.challenges || "") }}
                  />
                </div>

                <Link to={`/project/${project.id}`}>
                  <motion.div 
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button variant="outline" className="w-full group/btn border-primary/30 hover:border-primary hover:bg-primary/10">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
