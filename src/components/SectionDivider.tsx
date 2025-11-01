import { motion } from "framer-motion";

interface SectionDividerProps {
  className?: string;
}

export const SectionDivider = ({ className = "" }: SectionDividerProps) => {
  return (
    <motion.div 
      className={`flex items-center justify-center my-16 ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
      />
      <motion.div 
        className="mx-4"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
      </motion.div>
      <motion.div 
        className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
      />
    </motion.div>
  );
};
