import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Education } from "@/components/Education";
import TechStackHeatmap from "@/components/TechStackHeatmap";
import SkillsTimeline from "@/components/SkillsTimeline";
import { Projects } from "@/components/Projects";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { FutureProjects } from "@/components/FutureProjects";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
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
  });

  const { data: projects } = useQuery({
    queryKey: ['projects-for-schema'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, thumbnail_url')
        .eq('status', 'active')
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const siteUrl = window.location.origin;
  const title = heroData?.name ? `${heroData.name} | Full-Stack Developer & Data Engineer` : "Georges Boutros | Full-Stack Developer & Data Engineer";
  const description = heroData?.description || "Full Stack Developer & Data Engineer building modern, data-driven, and scalable web applications with React, Node.js, Python, AWS, and PostgreSQL.";

  // Structured data for the homepage
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "name": heroData?.name || "Georges Boutros",
        "jobTitle": heroData?.subtitle || "Full Stack Developer & Data Engineer",
        "url": siteUrl,
        "description": description,
        "knowsAbout": ["React", "Node.js", "Python", "TypeScript", "AWS", "PostgreSQL", "Data Engineering", "Full-Stack Development"],
        "sameAs": [
          "https://github.com/yourusername",
          "https://linkedin.com/in/yourusername"
        ]
      },
      {
        "@type": "WebSite",
        "name": "Georges Boutros Portfolio",
        "url": siteUrl,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${siteUrl}/#projects?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "ItemList",
        "itemListElement": projects?.map((project, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "CreativeWork",
            "name": project.title,
            "url": `${siteUrl}/project/${project.id}`,
            "image": project.thumbnail_url
          }
        })) || []
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
          }
        ]
      }
    ]
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
        <About />
        <Education />
        <TechStackHeatmap />
        <SkillsTimeline />
        <Projects />
        <Pricing />
        <Testimonials />
        <FutureProjects />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
