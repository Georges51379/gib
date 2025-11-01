import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

export const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.pageYOffset;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const raw = height > 0 ? (scrolled / height) * 100 : 0;
      const progress = Math.max(0, Math.min(100, raw));
      
      setIsVisible(scrolled > 300);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed right-8 top-1/2 -translate-y-1/2 z-50"
        >
          <div className="relative">
            <svg className="absolute inset-0 w-12 h-12 -rotate-90 z-10 pointer-events-none" viewBox="0 0 48 48">
              {/* Background circle - always visible */}
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                opacity="0.3"
                className="text-primary"
              />
              {/* Progress circle - fills as you scroll */}
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - scrollProgress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-150 text-primary drop-shadow-[0_0_8px_currentColor]"
              />
            </svg>
            <Button
              onClick={scrollToTop}
              size="icon"
              className="relative z-0 w-12 h-12 rounded-full gradient-bg text-white shadow-2xl hover:scale-110 transition-all duration-300"
              aria-label="Back to top"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
