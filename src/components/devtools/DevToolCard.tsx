import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DevTool } from "@/data/devToolsConfig";

interface DevToolCardProps {
  tool: DevTool;
  index: number;
  onOpen: () => void;
}

export const DevToolCard = ({ tool, index, onOpen }: DevToolCardProps) => {
  const Icon = tool.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {tool.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {tool.description}
      </p>

      {/* Action Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpen}
        className="group/btn w-full justify-between hover:bg-primary hover:text-primary-foreground"
      >
        Open Tool
        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </Button>

      {/* Category Badge */}
      <div className="absolute top-4 right-4">
        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground capitalize">
          {tool.category}
        </span>
      </div>
    </motion.div>
  );
};
