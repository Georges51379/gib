import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  User,
  DollarSign,
  Wrench,
  Star,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const HomePage = () => {
  const { data: heroData } = useQuery({
    queryKey: ["hero"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hero_section").select("*").single();
      if (error) throw error;
      return data;
    },
  });

  const { data: featuredProjects } = useQuery({
    queryKey: ["featured-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, slug, title, short_description, thumbnail_url, technologies, category_tags, featured"
        )
        .eq("status", "active")
        .eq("featured", true)
        .order("display_order", { ascending: true })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  /**
   * Enterprise-friendly future projects preview:
   * - Minimal select
   * - Explicit active filter (if exists), otherwise keep as-is on your table
   * - Limit to small number
   * - Safe rendering (no HTML injection)
   */
  const { data: futureProjects } = useQuery({
    queryKey: ["future-projects-preview"],
    queryFn: async () => {
      // If your future_projects table has a status column, uncomment the .eq('status','active')
      const { data, error } = await supabase
        .from("future_projects")
        .select("id, title, description, project_status, icon_name, display_order, features")
        // .eq("status", "active")
        .order("display_order", { ascending: true })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const { data: pricingPlans } = useQuery({
    queryKey: ["pricing-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_plans")
        .select("id, name, price, period, description, highlighted")
        .eq("status", "active")
        .order("display_order", { ascending: true })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const siteUrl = window.location.origin;
  const title = heroData?.name
    ? `${heroData.name} | Full-Stack Developer & Data Engineer`
    : "Georges Boutros | Full-Stack Developer & Data Engineer";
  const description =
    heroData?.description ||
    "Full Stack Developer & Data Engineer building modern, data-driven, and scalable web applications.";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: heroData?.name || "Georges Boutros",
        jobTitle: heroData?.subtitle || "Full Stack Developer & Data Engineer",
        url: siteUrl,
        description: description,
        knowsAbout: ["React", "Node.js", "Python", "TypeScript", "AWS", "PostgreSQL"],
        sameAs: ["https://github.com/Georges51379", "https://linkedin.com/in/georges-boutros-534960211"],
      },
      {
        "@type": "WebSite",
        name: "Georges Boutros Portfolio",
        url: siteUrl,
      },
    ],
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen">
      <SEO
        title={title}
        description={description}
        canonical={siteUrl}
        image="/logo-GIB.png"
        type="website"
        schema={schema}
      />
      <Navbar />
      <main>
        <Hero />

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
                <Card
                  key={project.id}
                  className="group overflow-hidden hover:shadow-lg transition-all duration-300"
                >
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

                    {/* IMPORTANT: slug-only navigation (no id fallback) */}
                    <Button asChild size="sm" className="w-full">
                      <Link to={`/projects/${project.slug}`}>View Case Study</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mini Future Projects Preview (inside Projects section) */}
            {futureProjects && futureProjects.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-bold">Future Projects</h3>
                  </div>
                  <Button asChild variant="ghost">
                    <Link to="/projects" className="flex items-center gap-2 text-sm">
                      See all projects
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {futureProjects.map((fp: any) => (
                    <Card
                      key={fp.id}
                      className="group hover:shadow-lg transition-all duration-300 border-border"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                          <CardTitle className="text-lg">{fp.title}</CardTitle>
                          {fp.project_status && (
                            <Badge variant="outline" className="text-xs">
                              {fp.project_status}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent>
                        {/* Safe text rendering (no dangerouslySetInnerHTML) */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {fp.description}
                        </p>

                        {/* Optional feature chips */}
                        {Array.isArray(fp.features) && fp.features.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {fp.features.slice(0, 4).map((feature: string) => (
                              <Badge key={feature} variant="secondary" className="text-[11px]">
                                {feature}
                              </Badge>
                            ))}
                            {fp.features.length > 4 && (
                              <Badge variant="secondary" className="text-[11px]">
                                +{fp.features.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
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
                I'm a Full-Stack Developer and Data Engineer with a passion for building secure,
                scalable web applications. With expertise in React, Node.js, Python, and cloud
                technologies, I help businesses transform their ideas into production-ready solutions.
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
                <Card
                  key={plan.id}
                  className={plan.highlighted ? "border-primary ring-2 ring-primary/20" : ""}
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-primary">
                      {plan.price}
                      <span className="text-sm text-muted-foreground">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Dev Tools Preview */}
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
                UUID generator, regex tester, and more. All tools run locally in your browser — no data
                sent to servers.
              </p>
              <Button asChild>
                <Link to="/dev-tools">Try Dev Tools</Link>
              </Button>
            </Card>
          </div>
        </motion.section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default HomePage;
