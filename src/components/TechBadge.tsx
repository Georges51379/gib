import { motion } from "framer-motion";
import { Code2 } from "lucide-react";

interface TechBadgeProps {
  technology: string;
  index?: number;
}

export const TechBadge = ({ technology, index = 0 }: TechBadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className="group relative"
    >
      <div className="px-4 py-2.5 rounded-lg bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary transition-transform duration-300 group-hover:rotate-12" />
          <span className="text-base font-semibold text-foreground">
            {technology}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
