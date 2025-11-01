import * as Icons from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { staggerContainer, staggerItem, fadeInUp, fadeInLeft, fadeInRight } from "@/utils/animations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import DOMPurify from "dompurify";

export const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { data: aboutData, isLoading } = useQuery({
    queryKey: ['about-section'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_section')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const iconMap: Record<string, any> = Icons;

  if (isLoading) {
    return (
      <section id="about" className="section-padding bg-[hsl(var(--section-bg))]" ref={ref}>
        <div className="container-custom space-y-8">
          <Skeleton className="h-12 w-48 mx-auto" />
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const skills = (aboutData?.skills as any[]) || [];
  const contentParts = aboutData?.content_main?.split('\n\n') || [];

  return (
    <section id="about" className="section-padding bg-[hsl(var(--section-bg))]" ref={ref}>
      <div className="container-custom">
        <motion.div 
          className="text-center mb-16"
          initial={fadeInUp.initial}
          animate={isInView ? fadeInUp.animate : fadeInUp.initial}
          transition={{ duration: 0.6 }}
        >
          <h2 className="gradient-text mb-4">{aboutData?.title || "About Me"}</h2>
          {aboutData?.subtitle && (
            <p className="text-lg text-muted-foreground mt-4">{aboutData.subtitle}</p>
          )}
          <motion.div 
            className="w-20 h-1 gradient-bg mx-auto rounded-full mt-4"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={fadeInLeft.initial}
            animate={isInView ? fadeInLeft.animate : fadeInLeft.initial}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
          <motion.div 
            className="aspect-square rounded-2xl overflow-hidden shadow-2xl relative group"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={aboutData?.image_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop"}
              alt={aboutData?.title || "About"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
          </motion.div>

          <motion.div 
            className="space-y-6"
            initial={fadeInRight.initial}
            animate={isInView ? fadeInRight.animate : fadeInRight.initial}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {aboutData?.content_intro && (
              <h3 
                className="text-3xl font-bold prose prose-invert max-w-none" 
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(aboutData.content_intro) }}
              />
            )}
            {contentParts.map((paragraph: string, index: number) => (
              <div 
                key={index} 
                className="text-lg text-muted-foreground leading-loose prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(paragraph) }}
              />
            ))}
          </motion.div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {skills.map((skill: any, index: number) => {
            const IconComponent = iconMap[skill.icon_name] || Icons.Code2;
            return (
              <motion.div
                key={skill.title}
                variants={staggerItem}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-2xl bg-card border border-border shadow-lg"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <IconComponent className="h-12 w-12 text-primary mb-4" />
                </motion.div>
                <h4 className="text-xl font-bold mb-3">{skill.title}</h4>
                <p className="text-muted-foreground">{skill.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
