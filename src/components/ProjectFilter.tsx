import { motion } from "framer-motion";

interface ProjectFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const ProjectFilter = ({ categories, activeCategory, onCategoryChange }: ProjectFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
      {categories.map((category) => (
        <motion.button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            activeCategory === category
              ? "gradient-bg text-white shadow-[0_0_20px_rgba(255,215,0,0.4)]"
              : "bg-card border border-border hover:border-primary/50 hover:text-primary"
          }`}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
};
