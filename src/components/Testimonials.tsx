import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { fadeInUp } from "@/utils/animations";
import { LazyImage } from "./LazyImage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  feedback: string;
  image_url: string;
  display_order: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials' as any)
        .select('*')
        .eq('status', 'active')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return ((data || []) as unknown) as Testimonial[];
    },
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (testimonials.length === 0) return;
    
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const current = testimonials[currentIndex];

  // Reset index if it's out of bounds
  useEffect(() => {
    if (testimonials.length > 0 && currentIndex >= testimonials.length) {
      setCurrentIndex(0);
    }
  }, [testimonials.length, currentIndex]);

  if (isLoading) {
    return (
      <section id="testimonials" className="section-padding" ref={ref}>
        <div className="container-custom">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-1 bg-muted rounded w-20 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return (
      <section id="testimonials" className="section-padding" ref={ref}>
        <div className="container-custom">
          <motion.div 
            className="text-center mb-16"
            initial={fadeInUp.initial}
            animate={isInView ? fadeInUp.animate : fadeInUp.initial}
            transition={{ duration: 0.6 }}
          >
            <h2 className="gradient-text mb-4">Client Feedback</h2>
            <motion.div 
              className="w-20 h-1 gradient-bg mx-auto rounded-full"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </motion.div>
          
          <motion.div 
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="p-8 rounded-2xl bg-card border border-border shadow-lg">
              <Quote className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-6">
                Client testimonials and project references are available upon request.
              </p>
              <p className="text-sm text-muted-foreground">
                I've worked with clients across various industries on projects ranging from 
                secure payment systems to data analytics dashboards. Happy to provide 
                references for serious inquiries.
              </p>
              <motion.button
                onClick={() => {
                  const element = document.querySelector("#contact");
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-6 px-6 py-2 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Request References
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <section id="testimonials" className="section-padding" ref={ref}>
      <div className="container-custom">
        <motion.div 
          className="text-center mb-16"
          initial={fadeInUp.initial}
          animate={isInView ? fadeInUp.animate : fadeInUp.initial}
          transition={{ duration: 0.6 }}
        >
          <h2 className="gradient-text mb-4">Client Testimonials</h2>
          <motion.div 
            className="w-20 h-1 gradient-bg mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Testimonial Card */}
            {current && (
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-xl hover:shadow-[0_0_40px_rgba(255,215,0,0.15)] transition-shadow"
                >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Quote className="h-12 w-12 text-primary/20 mb-6" />
                </motion.div>
                
                <p className="text-xl md:text-2xl mb-8 leading-relaxed">
                  "{current.feedback}"
                </p>

                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative"
                  >
                    <LazyImage
                      src={current.image_url}
                      alt={current.name}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/30"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                  <div>
                    <p className="font-bold text-lg">{current.name}</p>
                    <p className="text-muted-foreground">{current.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevTestimonial}
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </motion.div>

              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-8 bg-primary"
                        : "w-2 bg-muted-foreground/30"
                    }`}
                    whileHover={{ scale: 1.2 }}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextTestimonial}
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
