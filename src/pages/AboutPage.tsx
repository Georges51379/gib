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

  const siteUrl = 'https://georgesbuilds.dev';
  const title = "About Georges Boutros | Full Stack Developer & Data Engineer | React, Supabase, Enterprise Systems, Payment API Integration";
  const description = aboutData?.content_intro || "Learn about Georges Boutros, a Full-Stack Developer and Data Engineer based in Lebanon with expertise in React, Node.js, Python, and cloud technologies.";

  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "name": "About Georges Boutros",
    "description": description,
    "url": `${siteUrl}/about`,
    "mainEntity": {
      "@type": "Person",
      "name": "Georges Boutros",
      "givenName": "Georges",
      "familyName": "Boutros",
      "jobTitle": "Full Stack Developer & Data Engineer",
      "url": siteUrl,
      "image": `${siteUrl}/logo-GIB.png`,
      "email": "boutros.georges513@gmail.com",
      "nationality": { "@type": "Country", "name": "Lebanon" },
      "address": { "@type": "PostalAddress", "addressCountry": "LB", "addressLocality": "Lebanon" },
      "hasOccupation": [
        {
          "@type": "Occupation",
          "name": "Full Stack Developer",
          "occupationLocation": { "@type": "Country", "name": "Lebanon" },
          "skills": "React, Node.js, TypeScript, Python, AWS, PostgreSQL"
        },
        {
          "@type": "Occupation",
          "name": "Data Engineer",
          "occupationLocation": { "@type": "Country", "name": "Lebanon" },
          "skills": "Python, PostgreSQL, AWS, ETL, Data Pipelines"
        }
      ],
      "knowsAbout": ["React", "Node.js", "Python", "TypeScript", "AWS", "PostgreSQL", "Supabase"],
      "sameAs": [
        "https://github.com/Georges51379",
        "https://linkedin.com/in/georges-boutros-534960211"
      ]
    }
  };

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "About", url: `${siteUrl}/about` }
  ];

  const faqItems = [
    {
      question: "What is Georges Boutros's background?",
      answer: "Georges Boutros is a Full Stack Developer and Data Engineer based in Lebanon with expertise in React, Node.js, Python, TypeScript, AWS, PostgreSQL, and Supabase. He builds modern, scalable web applications and data solutions."
    },
    {
      question: "What technologies does Georges Boutros use?",
      answer: "Georges Boutros specializes in React, Node.js, Python, TypeScript, AWS, PostgreSQL, and Supabase. He has experience with full-stack web development, data engineering, cloud architecture, and API development."
    }
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title={title}
        description={description}
        canonical={`${siteUrl}/about`}
        image="/logo-GIB.png"
        type="website"
        schema={schema}
        keywords="about Georges Boutros, Full Stack Developer Lebanon, Data Engineer Lebanon, skills, experience, education, tech stack, React, Node.js, Python, Lebanese developer, Beirut developer"
        breadcrumbs={breadcrumbs}
        faqItems={faqItems}
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
