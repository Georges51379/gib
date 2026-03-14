import { Navbar } from "@/components/Navbar";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ServicesPage = () => {
  const { data: plans } = useQuery({
    queryKey: ['pricing-plans-seo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('name, price, description')
        .eq('status', 'active')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const siteUrl = 'https://georgesbuilds.dev';
  const title = "Web Development Services & Pricing in Lebanon | Full Stack Developer & Data Engineer | React, Supabase, Enterprise Systems, Payment API Integration | Georges Boutros";
  const description = "Professional web development and data engineering services from Lebanon. Full-stack applications, cloud solutions, and enterprise software. Transparent pricing.";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Web Development Services by Georges Boutros",
    "description": description,
    "url": `${siteUrl}/services`,
    "provider": {
      "@type": "Person",
      "name": "Georges Boutros",
      "url": siteUrl,
      "address": { "@type": "PostalAddress", "addressCountry": "LB", "addressLocality": "Lebanon" }
    },
    "areaServed": [
      { "@type": "Country", "name": "Lebanon" },
      { "@type": "Place", "name": "Worldwide" }
    ],
    "serviceType": ["Web Development", "Data Engineering", "Full Stack Development"],
    "offers": plans?.map(plan => ({
      "@type": "Offer",
      "name": plan.name,
      "price": plan.price.replace(/[^0-9.]/g, ''),
      "priceCurrency": "USD",
      "description": plan.description
    })) || []
  };

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Services & Pricing", url: `${siteUrl}/services` }
  ];

  const faqItems = [
    {
      question: "How much does web development cost in Lebanon?",
      answer: "Georges Boutros offers competitive web development pricing starting from affordable packages for landing pages to enterprise solutions. Visit the services page for detailed pricing plans."
    },
    {
      question: "Does Georges Boutros work remotely?",
      answer: "Yes, Georges Boutros is based in Lebanon and works remotely with clients worldwide. He provides full-stack web development and data engineering services to clients across the Middle East, Europe, and globally."
    },
    {
      question: "What technologies does Georges Boutros use for web development?",
      answer: "Georges Boutros uses modern technologies including React, Node.js, Python, TypeScript, AWS, PostgreSQL, and Supabase to build scalable, production-ready web applications and data solutions."
    }
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title={title}
        description={description}
        canonical={`${siteUrl}/services`}
        image="/logo-GIB.png"
        type="website"
        schema={schema}
        keywords="web development services Lebanon, pricing, freelance developer Lebanon, full stack development, data engineering, React developer, hire developer Lebanon, Georges Boutros services, Beirut developer"
        breadcrumbs={breadcrumbs}
        faqItems={faqItems}
      />
      <Navbar />
      <main className="pt-20">
        <Pricing />
        <Testimonials />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default ServicesPage;
