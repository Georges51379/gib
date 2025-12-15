import { ArrowDown } from "lucide-react";
import { Button } from "./ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeInUp, fadeInDown } from "@/utils/animations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import DOMPurify from "dompurify";
import { lazy, Suspense } from "react";

const Hero3DScene = lazy(() => import('./Hero3DScene'));

export const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const { data: heroData, isLoading } = useQuery({
    queryKey: ['hero-section'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_section')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleScroll = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <section id="home" className="relative h-screen flex items-center justify-center">
        <div className="container-custom text-center space-y-6">
          <Skeleton className="h-16 w-3/4 mx-auto" />
          <Skeleton className="h-12 w-1/2 mx-auto" />
          <Skeleton className="h-24 w-2/3 mx-auto" />
        </div>
      </section>
    );
  }

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-pulse" style={{ animationDuration: '8s' }} />
      
      {/* Background Video with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src={heroData?.video_url && heroData.video_url.trim() !== '' 
              ? heroData.video_url 
              : "https://assets.mixkit.co/videos/preview/mixkit-computer-code-closeup-1181-large.mp4"}
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-[hsl(var(--hero-overlay))]" style={{ opacity: heroData?.background_overlay_opacity || 0.7 }} />
      </motion.div>

      {/* 3D Scene Layer */}
      <Suspense fallback={null}>
        <div className="absolute inset-0 z-[2]">
          <Hero3DScene />
        </div>
      </Suspense>

      {/* Content */}
      <motion.div 
        className="relative z-10 container-custom text-center"
        style={{ opacity }}
      >
        <motion.h1 
          initial={fadeInDown.initial}
          animate={fadeInDown.animate}
          transition={{ duration: 0.6 }}
          className="text-white mb-6 text-3xl md:text-5xl lg:text-6xl"
        >
          Hi, I'm <span className="gradient-text">{heroData?.name || "Georges Boutros"}</span>
        </motion.h1>
        
        <motion.p 
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg md:text-2xl lg:text-3xl text-white/90 mb-8 font-light max-w-3xl mx-auto"
        >
          {heroData?.subtitle || "Full-Stack Developer & Data Engineer"}
        </motion.p>
        
        <motion.div 
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-base md:text-lg lg:text-xl text-white/80 mb-12 max-w-2xl mx-auto prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(heroData?.description || "Building innovative solutions with modern technologies") 
          }}
        />
        
        <motion.div 
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="gradient-bg text-white font-semibold px-8 py-6 text-lg hover:opacity-90 transition-smooth relative overflow-hidden group"
              onClick={() => handleScroll("#projects")}
            >
              <span className="relative z-10">{heroData?.cta_primary_text || "See My Work"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-hover to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary dark:border-white text-primary dark:text-white hover:bg-primary/10 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white font-semibold px-8 py-6 text-lg transition-smooth backdrop-blur-sm relative overflow-hidden group"
              onClick={() => handleScroll("#contact")}
            >
              <span className="relative z-10">{heroData?.cta_secondary_text || "Contact Me"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity }}
      >
        <button
          onClick={() => handleScroll("#about")}
          aria-label="Scroll to about section"
          className="text-white/80 hover:text-white transition-smooth"
        >
          <ArrowDown className="h-8 w-8" />
        </button>
      </motion.div>
    </section>
  );
};
