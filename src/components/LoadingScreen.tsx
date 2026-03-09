import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const dismiss = () => setIsLoading(false);

    if (document.readyState === 'complete') {
      // Already loaded — show briefly for branding then dismiss
      const t = setTimeout(dismiss, 400);
      return () => clearTimeout(t);
    }

    // Wait for load event, with 1.5s max fallback
    window.addEventListener('load', dismiss, { once: true });
    const fallback = setTimeout(dismiss, 1500);

    return () => {
      window.removeEventListener('load', dismiss);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-background via-background to-card"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-bold mb-4"
            >
              <span className="gradient-text">G·B</span>
            </motion.div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="h-1 w-32 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
