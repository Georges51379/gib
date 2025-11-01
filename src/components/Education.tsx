import { GraduationCap, Award } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, fadeInLeft, fadeInRight } from "@/utils/animations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import DOMPurify from "dompurify";

export const Education = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { data: educationItems = [], isLoading } = useQuery({
    queryKey: ['education'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section id="education" className="section-padding" ref={ref}>
        <div className="container-custom space-y-8">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-96 w-full" />
        </div>
      </section>
    );
  }

  return (
    <section id="education" className="section-padding bg-gradient-to-br from-background via-[hsl(var(--section-bg))] to-background" ref={ref}>
      <div className="container-custom">
        <motion.div 
          className="text-center mb-16"
          initial={fadeInUp.initial}
          animate={isInView ? fadeInUp.animate : fadeInUp.initial}
          transition={{ duration: 0.6 }}
        >
          <h2 className="gradient-text mb-4">Education & Certificates</h2>
          <motion.div 
            className="w-20 h-1 gradient-bg mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <motion.div 
            className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary to-secondary"
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ originY: 0 }}
          />

          <div className="space-y-12">
            {educationItems.map((item, index) => {
              const isEven = index % 2 === 0;
              const animationVariant = isEven ? fadeInLeft : fadeInRight;

              return (
                <motion.div
                  key={index}
                  className="relative grid md:grid-cols-2 gap-8 items-center"
                  initial={animationVariant.initial}
                  animate={isInView ? animationVariant.animate : animationVariant.initial}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  {/* Content */}
                  <div className={`${isEven ? 'md:text-right' : 'md:col-start-2'}`}>
                    <motion.div 
                      className="p-6 rounded-2xl bg-card border border-border shadow-lg hover:border-primary/50 hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] transition-all"
                      whileHover={{ scale: 1.02, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                          transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                        >
                          {index < 2 ? (
                            <GraduationCap className="h-6 w-6 text-primary" />
                          ) : (
                            <Award className="h-6 w-6 text-secondary" />
                          )}
                        </motion.div>
                        <span className="text-sm font-semibold text-primary">{item.year}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{item.institution}</h3>
                      <h4 className="text-lg font-semibold text-muted-foreground mb-3">{item.degree}</h4>
                      <div 
                        className="text-muted-foreground mb-4 leading-relaxed prose prose-sm prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.description) }}
                      />
                      <div className="flex flex-wrap gap-2">
                        {item.technologies.map((tech, techIndex) => (
                          <motion.span
                            key={tech}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                            transition={{ delay: 0.8 + index * 0.1 + techIndex * 0.05 }}
                            whileHover={{ scale: 1.1 }}
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Center dot */}
                  <motion.div 
                    className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-[0_0_20px_rgba(255,215,0,0.6)]"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.5 }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
