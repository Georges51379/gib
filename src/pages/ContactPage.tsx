import { Navbar } from "@/components/Navbar";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SEO } from "@/components/SEO";

const ContactPage = () => {
  const siteUrl = 'https://gib-two.vercel.app';
  const title = "Contact Georges Boutros | Full Stack Developer & Data Engineer | React, Supabase, Enterprise Systems, Payment API Integration | Hire a Developer in Lebanon";
  const description = "Get in touch with Georges Boutros, Full-Stack Developer & Data Engineer in Lebanon. Available for freelance projects, contract work, and remote collaboration worldwide.";

  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Georges Boutros",
    "description": description,
    "url": `${siteUrl}/contact`,
    "mainEntity": {
      "@type": "Person",
      "name": "Georges Boutros",
      "email": "boutros.georges513@gmail.com",
      "jobTitle": "Full Stack Developer & Data Engineer",
      "url": siteUrl,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "LB",
        "addressLocality": "Lebanon"
      },
      "sameAs": [
        "https://github.com/Georges51379",
        "https://linkedin.com/in/georges-boutros-534960211"
      ]
    }
  };

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Contact", url: `${siteUrl}/contact` }
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title={title}
        description={description}
        canonical={`${siteUrl}/contact`}
        image="/logo-GIB.png"
        type="website"
        schema={schema}
        keywords="contact Georges Boutros, hire developer Lebanon, freelance developer Lebanon, web development consultation, full stack developer Lebanon, Beirut developer, Lebanese software engineer"
        breadcrumbs={breadcrumbs}
      />
      <Navbar />
      <main className="pt-20">
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default ContactPage;
