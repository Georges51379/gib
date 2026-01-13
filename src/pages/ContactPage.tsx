import { Navbar } from "@/components/Navbar";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SEO } from "@/components/SEO";

const ContactPage = () => {
  const siteUrl = window.location.origin;
  const title = "Contact | Georges Boutros - Get in Touch";
  const description = "Have a project in mind? Get in touch to discuss how I can help build your next web application or data solution.";

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
      "sameAs": [
        "https://github.com/Georges51379",
        "https://linkedin.com/in/georges-boutros-534960211"
      ]
    }
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title={title}
        description={description}
        canonical={`${siteUrl}/contact`}
        image="/logo-GIB.png"
        type="website"
        schema={schema}
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