import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { fadeInUp } from "@/utils/animations";
import { LazyImage } from "./LazyImage";

export const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO at TechStart",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      feedback: "Georges delivered an exceptional e-commerce platform that exceeded our expectations. His attention to detail and technical expertise made the entire process smooth and efficient."
    },
    {
      name: "Michael Chen",
      role: "CTO at DataCorp",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      feedback: "The data analytics dashboard Georges built for us has transformed how we make decisions. The real-time insights are invaluable, and the system handles our massive data volume effortlessly."
    },
    {
      name: "Emily Rodriguez",
      role: "Product Manager at InnovateLab",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      feedback: "Working with Georges was a pleasure. He not only understood our technical requirements but also provided valuable insights that improved our product. Highly recommended!"
    }
  ];

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
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = testimonials[currentIndex];

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
                      src={current.image}
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
