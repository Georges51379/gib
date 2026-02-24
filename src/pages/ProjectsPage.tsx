import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, ExternalLink, Search, Filter, User, Users, UserCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FutureProjects } from "@/components/FutureProjects"; // ✅ added

const ProjectsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [techFilter, setTechFilter] = useState<string>("all");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["all-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "active")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Extract unique categories and technologies
  const { categories, technologies } = useMemo(() => {
    if (!projects) return { categories: [], technologies: [] };

    const catSet = new Set<string>();
    const techSet = new Set<string>();

    projects.forEach((project) => {
      project.category_tags?.forEach((tag: string) => catSet.add(tag));
      project.technologies?.forEach((tech: string) => techSet.add(tech));
    });

    return {
      categories: Array.from(catSet).sort(),
      technologies: Array.from(techSet).sort(),
    };
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.short_description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || project.category_tags?.includes(categoryFilter);

      const matchesTech = techFilter === "all" || project.technologies?.includes(techFilter);

      return matchesSearch && matchesCategory && matchesTech;
    });
  }, [projects, searchQuery, categoryFilter, techFilter]);

  // Separate featured and regular projects
  const featuredProjects = filteredProjects.filter((p) => p.featured);
  const regularProjects = filteredProjects.filter((p) => !p.featured);

  const siteUrl = window.location.origin;
  const title = "Projects | Georges Boutros - Portfolio";
  const description =
    "Explore my portfolio of full-stack web applications, data engineering projects, and enterprise solutions built with React, Node.js, Python, and cloud technologies.";

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Projects Portfolio",
    "description": description,
    "url": `${siteUrl}/projects`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement":
        projects?.map((project: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "CreativeWork",
            "name": project.title,
            "description": project.short_description,
            "url": `${siteUrl}/projects/${project.slug || project.id}`,
          },
        })) || [],
    },
  };

  const getRoleIcon = (role: string | null) => {
    switch (role?.toLowerCase()) {
      case "solo":
        return <User className="w-3 h-3" />;
      case "team":
        return <Users className="w-3 h-3" />;
      case "lead":
        return <UserCheck className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen">
      <SEO
        title={title}
        description={description}
        canonical={`${siteUrl}/projects`}
        image="/logo-GIB.png"
        type="website"
        schema={schema}
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              My <span className="gradient-text">Projects</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A collection of enterprise-grade web applications, data solutions, and innovative
              tools I've built.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={techFilter} onValueChange={setTechFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Technology" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technologies</SelectItem>
                  {technologies.map((tech) => (
                    <SelectItem key={tech} value={tech}>
                      {tech}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Featured Projects */}
          {featuredProjects.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                Featured Projects
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProjects.map((project: any, index: number) => (
                  <motion.div
                    key={project.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-primary/20">
                      <div className="aspect-video overflow-hidden relative">
                        <img
                          src={project.thumbnail_url}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary text-primary-foreground">
                            <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                          </Badge>
                        </div>
                      </div>

                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          {project.role && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              {getRoleIcon(project.role)}
                              {project.role}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {project.short_description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {project.category_tags?.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button asChild size="sm" className="flex-1">
                            <Link to={`/projects/${project.slug || project.id}`}>View Case Study</Link>
                          </Button>
                          {project.live_url && (
                            <Button asChild size="sm" variant="outline">
                              <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Projects */}
          {regularProjects.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">All Projects</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularProjects.map((project: any, index: number) => (
                  <motion.div
                    key={project.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="group h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={project.thumbnail_url}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          {project.role && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              {getRoleIcon(project.role)}
                              {project.role}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {project.short_description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {project.category_tags?.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="outline" className="flex-1">
                            <Link to={`/projects/${project.slug || project.id}`}>View Details</Link>
                          </Button>
                          {project.live_url && (
                            <Button asChild size="sm" variant="outline">
                              <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {filteredProjects.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No projects match your filters.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setTechFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* ✅ Future Projects section */}
        <FutureProjects />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default ProjectsPage;
