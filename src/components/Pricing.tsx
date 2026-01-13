import { Check, Package } from "lucide-react";
import { Button } from "./ui/button";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { staggerContainer, staggerItem, fadeInUp } from "@/utils/animations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";

export const Pricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const handleContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <section id="pricing" className="section-padding" ref={ref}>
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="gradient-text mb-4">Services & Pricing</h2>
            <div className="w-20 h-1 gradient-bg mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="section-padding" ref={ref}>
      <div className="container-custom">
        <motion.div 
          className="text-center mb-16"
          initial={fadeInUp.initial}
          animate={isInView ? fadeInUp.animate : fadeInUp.initial}
          transition={{ duration: 0.6 }}
        >
          <h2 className="gradient-text mb-4">Services & Pricing</h2>
          <motion.div 
            className="w-20 h-1 gradient-bg mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto">
            Flexible pricing options to fit your project needs
          </p>
        </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate={isInView ? "animate" : "initial"}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={staggerItem}
              whileHover={{ y: plan.highlighted ? 0 : -12, scale: plan.highlighted ? 1 : 1.02 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl p-8 relative ${
                plan.highlighted
                  ? "gradient-bg text-white shadow-[0_0_40px_rgba(255,215,0,0.3)] border-2 border-primary/50 transform scale-105"
                  : "bg-card border border-border shadow-lg hover:border-primary/30 hover:shadow-xl"
              }`}
            >
              {plan.highlighted && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse"
                  style={{ animationDuration: '3s' }}
                >
                  Most Popular
                </motion.div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className={`mb-6 leading-relaxed ${plan.highlighted ? "text-white/80" : "text-muted-foreground"}`}>
                {plan.description}
              </p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={`ml-2 ${plan.highlighted ? "text-white/80" : "text-muted-foreground"}`}>
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li 
                    key={feature} 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ delay: 0.6 + index * 0.1 + featureIndex * 0.03 }}
                  >
                    <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? "text-white" : "text-primary"
                    }`} />
                    <span className={plan.highlighted ? "text-white/90" : ""}>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Deliverables Section */}
              {plan.deliverables && plan.deliverables.length > 0 && (
                <div className={`mb-6 pt-4 border-t ${plan.highlighted ? "border-white/20" : "border-border"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className={`h-4 w-4 ${plan.highlighted ? "text-white/80" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-semibold ${plan.highlighted ? "text-white/80" : "text-muted-foreground"}`}>
                      What's Included:
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {plan.deliverables.map((deliverable: string, dIndex: number) => (
                      <motion.li 
                        key={deliverable} 
                        className={`text-sm flex items-start gap-2 ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ delay: 0.8 + index * 0.1 + dIndex * 0.02 }}
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
                        <span>{deliverable}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleContact}
                  className={`w-full font-semibold relative overflow-hidden group/btn ${
                    plan.highlighted
                      ? "bg-white text-primary hover:bg-white/90 shadow-lg"
                      : "border-primary/30 hover:border-primary hover:bg-primary/10"
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  <span className="relative z-10">
                    {plan.cta_text || (plan.name?.toLowerCase().includes('enterprise') ? 'Book a Call' : 'Get Started')}
                  </span>
                  {!plan.highlighted && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  )}
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
