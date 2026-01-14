import { ArrowDown } from "lucide-react";
import { Button } from "./ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeInUp, fadeInDown } from "@/utils/animations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import DOMPurify from "dompurify";
import { lazy, Suspense, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Hero3DScene = lazy(() => import("./Hero3DScene"));

export const Hero = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const { data: heroData, isLoading } = useQuery({
    queryKey: ["hero-section"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hero_section").select("*").single();
      if (error) throw error;
      return data;
    },
  });

  const safeScrollTo = useCallback((hash: string) => {
    if (!hash.startsWith("#")) return;

    // Wait a tick to ensure DOM is ready (helps if called right after a route change)
    requestAnimationFrame(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const goToProjects = useCallback(() => {
    // Enterprise-friendly: explicit routing, no reliance on fragile in-page anchors
    navigate("/projects");
  }, [navigate]);

  const goToContact = useCallback(() => {
    navigate("/contact");
  }, [navigate]);

  const goToAbout = useCallback(() => {
    // If you ever switch to a homepage "#about" section, you can adapt this easily.
    navigate("/about");
  }, [navigate]);

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

  const videoSrc =
    heroData?.video_url && heroData.video_url.trim() !== ""
      ? heroData.video_url
      : "https://assets.mixkit.co/videos/preview/mixkit-computer-code-closeup-1181-large.mp4";

  const overlayOpacity =
    typeof heroData?.background_overlay_opacity === "number"
      ? heroData.background_overlay_opacity
      : 0.7;

  const sanitizedDescription = DOMPurify.sanitize(
    heroData?.description || "Building innovative solutions with modern technologies",
    {
      // keep formatting if you want; if you prefer plain text only, set ALLOWED_TAGS: []
      // ALLOWED_TAGS: [],
      // ALLOWED_ATTR: [],
    }
  );

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Overlay */}
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-pulse"
        style={{ animationDuration: "8s" }}
      />

      {/* Background Video with Parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src={videoSrc} type="video/mp4" />
        </video>

        <div
          className="absolute inset-0 bg-[hsl(var(--hero-overlay))]"
          style={{ opacity: overlayOpacity }}
        />
      </motion.div>

      {/* 3D Scene Layer */}
      <Suspense fallback={null}>
        <div className="absolute inset-0 z-[2]">
          <Hero3DScene />
        </div>
      </Suspense>

      {/* Content */}
      <motion.div className="relative z-10 container-custom text-center" style={{ opacity }}>
        <motion.h1
          initial={fadeInDown.initial}
          animate={fadeInDown.animate}
          transition={{ duration: 0.6 }}
          className="text-white mb-6 text-3xl md:text-5xl lg:text-6xl"
        >
          Hi, I&apos;m <span className="gradient-text">{heroData?.name || "Georges Boutros"}</span>
        </motion.h1>

        <motion.p
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg md:text-2xl lg:text-3xl text-white/90 mb-4 font-light max-w-3xl mx-auto"
        >
          {heroData?.subtitle || "Full-Stack Developer & Data Engineer"}
        </motion.p>

        {/* Tagline */}
        {heroData?.tagline && (
          <motion.p
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-base md:text-lg text-white/70 mb-6 max-w-2xl mx-auto italic"
          >
            {heroData.tagline}
          </motion.p>
        )}

        {/* Trust Badges */}
        {heroData?.trust_badges && heroData.trust_badges.length > 0 && (
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-2 mb-6"
          >
            {heroData.trust_badges.map((badge: string, index: number) => (
              <motion.span
                key={`${badge}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="px-3 py-1.5 text-sm font-medium bg-primary/20 text-primary border border-primary/30 rounded-full backdrop-blur-sm"
              >
                {badge}
              </motion.span>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-base md:text-lg lg:text-xl text-white/80 mb-12 max-w-2xl mx-auto prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />

        {/* CTAs */}
        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              size="lg"
              className="gradient-bg text-white font-semibold px-8 py-6 text-lg hover:opacity-90 transition-smooth relative overflow-hidden group"
              onClick={goToProjects}
              aria-label="Go to Projects page"
            >
              <span className="relative z-10">
                {heroData?.cta_primary_text || "View Case Studies"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-hover to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="border-2 border-primary dark:border-white text-primary dark:text-white hover:bg-primary/10 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white font-semibold px-8 py-6 text-lg transition-smooth backdrop-blur-sm relative overflow-hidden group"
              onClick={goToContact}
              aria-label="Go to Contact page"
            >
              <span className="relative z-10">{heroData?.cta_secondary_text || "Book a Call"}</span>
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
          type="button"
          onClick={goToAbout}
          aria-label="Go to About page"
          className="text-white/80 hover:text-white transition-smooth"
        >
          <ArrowDown className="h-8 w-8" />
        </button>
      </motion.div>
    </section>
  );
};
