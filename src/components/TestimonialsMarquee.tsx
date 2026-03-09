import { useRef } from "react";
import { Quote } from "lucide-react";
import { motion, useInView } from "framer-motion";
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
};

const MarqueeRow = ({ testimonials, reverse = false }: { testimonials: Testimonial[]; reverse?: boolean }) => {
  // Duplicate for seamless loop
  const items = [...testimonials, ...testimonials];

  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        className="flex gap-6 shrink-0"
        animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {items.map((t, i) => (
          <div
            key={`${t.id}-${i}`}
            className="w-[350px] md:w-[400px] shrink-0 bg-card border border-border rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <Quote className="h-8 w-8 text-primary/20 mb-4" />
            <p className="text-sm md:text-base leading-relaxed mb-6 line-clamp-4">
              "{t.feedback}"
            </p>
            <div className="flex items-center gap-3">
              <LazyImage
                src={t.image_url}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
              />
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export const TestimonialsMarquee = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials-marquee'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'active')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as Testimonial[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="section-padding" ref={ref}>
        <div className="container-custom text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4" />
            <div className="h-1 bg-muted rounded w-20 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials.length) {
    return (
      <section className="section-padding" ref={ref}>
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
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
          <div className="max-w-2xl mx-auto text-center p-8 rounded-2xl bg-card border border-border shadow-lg">
            <Quote className="h-12 w-12 text-primary/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              Client testimonials and project references are available upon request.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const half = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, half);
  const row2 = testimonials.slice(half);

  return (
    <section className="section-padding overflow-hidden" ref={ref}>
      <div className="container-custom">
        <motion.div
          className="text-center mb-12"
          initial={fadeInUp.initial}
          animate={isInView ? fadeInUp.animate : fadeInUp.initial}
          transition={{ duration: 0.6 }}
        >
          <h2 className="gradient-text mb-4">What Clients Say</h2>
          <motion.div
            className="w-20 h-1 gradient-bg mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.div>
      </div>
      <div className="space-y-6">
        <MarqueeRow testimonials={row1.length >= 2 ? row1 : testimonials} />
        {row2.length >= 2 && <MarqueeRow testimonials={row2} reverse />}
      </div>
    </section>
  );
};
