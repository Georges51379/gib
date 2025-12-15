import * as Icons from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { staggerContainer, staggerItem, fadeInUp } from "@/utils/animations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";

export const FutureProjects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { data: futureProjects = [], isLoading } = useQuery({
    queryKey: ['future-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('future_projects')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const iconMap: Record<string, any> = Icons;

  const getStatusColor = (status: string) => {
    return status === "In Development" ? "text-secondary" : "text-primary";
  };

  if (isLoading) {
    return (
      <section className="section-padding bg-[hsl(var(--section-bg))]" ref={ref}>
        <div className="container-custom space-y-8">
          <Skeleton className="h-12 w-64 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-[hsl(var(--section-bg))]" ref={ref}>
      <div className="container-custom">
        <motion.div 
          className="text-center mb-16"
          initial={fadeInUp.initial}
          animate={isInView ? fadeInUp.animate : fadeInUp.initial}
          transition={{ duration: 0.6 }}
        >
          <h2 className="gradient-text mb-4">Future Projects</h2>
          <motion.div 
            className="w-20 h-1 gradient-bg mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto">
            Exciting ideas and innovations currently in the works
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {futureProjects.map((project: any, index: number) => {
            const IconComponent = iconMap[project.icon_name] || Icons.Lightbulb;
            return (
              <motion.div
                key={project.title}
                variants={staggerItem}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-2xl bg-card border border-border shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  >
                    <IconComponent className="h-12 w-12 text-primary" />
                  </motion.div>
                  <motion.span 
                    className={`text-sm font-semibold ${getStatusColor(project.project_status)}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    {project.project_status}
                  </motion.span>
                </div>

                <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">{project.description}</p>

                <div>
                  <p className="text-sm font-semibold mb-2">Expected Features:</p>
                  <ul className="space-y-1">
                    {(project.features || []).map((feature: string, featureIndex: number) => (
                      <motion.li 
                        key={feature} 
                        className="text-sm text-muted-foreground flex items-start gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ delay: 0.7 + index * 0.1 + featureIndex * 0.05 }}
                      >
                        <span className="text-primary mt-1">•</span>
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
