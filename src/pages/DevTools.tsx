import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { DevToolCard } from "@/components/devtools/DevToolCard";
import { DevToolModal } from "@/components/devtools/DevToolModal";
import { devTools, categories, type DevTool } from "@/data/devToolsConfig";
import { Wrench } from "lucide-react";

const DevTools = () => {
  const [selectedTool, setSelectedTool] = useState<DevTool | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTools = activeCategory === "all" 
    ? devTools 
    : devTools.filter(tool => tool.category === activeCategory);

  const siteUrl = 'https://gib-two.vercel.app';

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Developer Tools by Georges Boutros",
    "description": "Free developer tools including password generator, JWT decoder, Base64 encoder, JSON formatter, and more. All tools run 100% client-side for privacy.",
    "url": `${siteUrl}/dev-tools`,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "Georges Boutros",
      "url": siteUrl
    },
    "featureList": devTools.map(t => t.name).join(", ")
  };

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Developer Tools", url: `${siteUrl}/dev-tools` }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Free Developer Tools | JSON Formatter, Base64, UUID Generator"
        description="Free, privacy-focused developer utilities: JSON formatter, Base64 encoder, UUID generator, JWT decoder, regex tester, password generator, and more. 100% client-side."
        canonical={`${siteUrl}/dev-tools`}
        keywords="developer tools, JSON formatter, Base64 encoder, UUID generator, JWT decoder, regex tester, password generator, hash generator, free online tools, Georges Boutros"
        schema={schema}
        breadcrumbs={breadcrumbs}
      />
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container-custom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Wrench className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Dev Tools</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Free, privacy-focused developer utilities. All tools run entirely in your browser — 
              no data is ever sent to any server.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category.name}
              </button>
            ))}
          </motion.div>

          {/* Tools Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredTools.map((tool, index) => (
              <DevToolCard
                key={tool.id}
                tool={tool}
                index={index}
                onOpen={() => setSelectedTool(tool)}
              />
            ))}
          </motion.div>

          {/* Privacy Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              100% Client-Side — Your data never leaves your browser
            </div>
          </motion.div>
        </div>
      </main>

      {/* Tool Modal */}
      <DevToolModal
        tool={selectedTool}
        onClose={() => setSelectedTool(null)}
      />

      <Footer />
    </div>
  );
};

export default DevTools;
