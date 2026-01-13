import { Navbar } from "@/components/Navbar";
import { About } from "@/components/About";
import { Education } from "@/components/Education";
import TechStackHeatmap from "@/components/TechStackHeatmap";
import SkillsTimeline from "@/components/SkillsTimeline";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AboutPage = () => {
  const { data: aboutData } = useQuery({
    queryKey: ['about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_section')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const siteUrl = window.location.origin;
  const title = "About | Georges Boutros - Full-Stack Developer";
  const description = aboutData?.content_intro || "Learn about Georges Boutros, a Full-Stack Developer and Data Engineer with expertise in React, Node.js, Python, and cloud technologies.";

  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Georges Boutros",
    "description": description,
    "url": `${siteUrl}/about`,
    "mainEntity": {
      "@type": "Person",
      "name": "Georges Boutros",
      "jobTitle": "Full Stack Developer & Data Engineer",
      "url": siteUrl
    }
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title={title}
        description={description}
        canonical={`${siteUrl}/about`}
        image="/logo-GIB.png"
        type="website"
        schema={schema}
      />
      <Navbar />
      <main className="pt-20">
        <About />
        <Education />
        <TechStackHeatmap />
        <SkillsTimeline />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default AboutPage;