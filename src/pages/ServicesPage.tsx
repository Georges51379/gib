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

  const siteUrl = window.location.origin;
  const title = "Services & Pricing | Georges Boutros - Web Development";
  const description = "Professional web development services including full-stack applications, data engineering, and enterprise solutions. Transparent pricing and deliverables.";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Web Development Services",
    "description": description,
    "url": `${siteUrl}/services`,
    "provider": {
      "@type": "Person",
      "name": "Georges Boutros"
    },
    "offers": plans?.map(plan => ({
      "@type": "Offer",
      "name": plan.name,
      "price": plan.price.replace(/[^0-9.]/g, ''),
      "priceCurrency": "USD",
      "description": plan.description
    })) || []
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title={title}
        description={description}
        canonical={`${siteUrl}/services`}
        image="/logo-GIB.png"
        type="website"
        schema={schema}
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