import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const categories = ['All', 'Frontend', 'Backend', 'Database', 'Cloud', 'AI', 'Tools', 'DevOps'] as const;
type Category = typeof categories[number];

const categoryColors: Record<string, string> = {
  Frontend: 'hsl(210, 100%, 60%)',
  Backend: 'hsl(140, 70%, 45%)',
  Database: 'hsl(30, 90%, 55%)',
  Cloud: 'hsl(190, 90%, 50%)',
  AI: 'hsl(270, 70%, 60%)',
  Tools: 'hsl(45, 90%, 55%)',
  DevOps: 'hsl(0, 70%, 55%)',
};

interface TechItem {
  id: string;
  name: string;
  category: string;
  experience_level: number;
  description: string;
  icon: string | null;
  display_order: number;
  status: string;
}

type TooltipPlacement = 'top' | 'bottom';

const TechBubble = ({ tech, index }: { tech: TechItem; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
    arrowLeft: number;
    placement: TooltipPlacement;
  }>({
    top: 0,
    left: 0,
    arrowLeft: 0,
    placement: 'top',
  });

  // Size based on experience level (min 60px, max 120px)
  const size = 60 + (tech.experience_level / 100) * 60;
  // Opacity based on experience level (min 0.5, max 1)
  const opacity = 0.5 + (tech.experience_level / 100) * 0.5;

  const categoryColor = categoryColors[tech.category] || 'hsl(var(--primary))';

  const updateTooltipPosition = useCallback(() => {
    const bubbleEl = bubbleRef.current;
    const tooltipEl = tooltipRef.current;
    if (!bubbleEl || !tooltipEl) return;

    const padding = 8; // viewport padding
    const gap = 12; // gap between bubble and tooltip

    const bubbleRect = bubbleEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();

    const centerX = bubbleRect.left + bubbleRect.width / 2;

    // Default place tooltip above
    let placement: TooltipPlacement = 'top';
    let top = bubbleRect.top - gap - tooltipRect.height;

    // Flip to bottom if not enough room above
    if (top < padding) {
      placement = 'bottom';
      top = bubbleRect.bottom + gap;
    }

    // Clamp left within viewport
    let left = centerX - tooltipRect.width / 2;
    left = Math.max(padding, Math.min(left, window.innerWidth - padding - tooltipRect.width));

    // Arrow should point to bubble center, but stay inside tooltip bounds
    let arrowLeft = centerX - left;
    arrowLeft = Math.max(14, Math.min(arrowLeft, tooltipRect.width - 14));

    setTooltipPos({ top, left, arrowLeft, placement });
  }, []);

  // Reposition on open + on resize/scroll
  useEffect(() => {
    if (!isOpen) return;

    const raf = requestAnimationFrame(() => updateTooltipPosition());

    const onResize = () => updateTooltipPosition();
    const onScroll = () => updateTooltipPosition();

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isOpen, updateTooltipPosition]);

  // Close on outside click (mobile-friendly)
  useEffect(() => {
    if (!isOpen) return;

    const handleDown = (e: MouseEvent | TouchEvent) => {
      const bubbleEl = bubbleRef.current;
      const tooltipEl = tooltipRef.current;
      const target = e.target as Node | null;

      if (!target) return;
      if (bubbleEl?.contains(target)) return;
      if (tooltipEl?.contains(target)) return;

      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleDown);
    document.addEventListener('touchstart', handleDown, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('touchstart', handleDown);
    };
  }, [isOpen]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.03,
        layout: { duration: 0.3 },
      }}
      className="relative group"
      ref={bubbleRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      onClick={() => setIsOpen((v) => !v)} // tap/click support
      role="button"
      tabIndex={0}
      aria-label={`${tech.name} details`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen((v) => !v);
        }
        if (e.key === 'Escape') setIsOpen(false);
      }}
    >
      <motion.div
        className="relative flex items-center justify-center rounded-2xl cursor-pointer overflow-hidden"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${categoryColor}20, ${categoryColor}40)`,
          border: `2px solid ${categoryColor}60`,
        }}
        whileHover={{
          scale: 1.1,
          boxShadow: `0 0 30px ${categoryColor}40`,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Inner glow effect */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${categoryColor}30, transparent 70%)`,
            opacity,
          }}
        />

        {/* Tech name */}
        <span
          className="relative z-10 font-semibold text-center px-2 leading-tight"
          style={{
            fontSize: Math.max(10, size / 6),
            color: categoryColor,
          }}
        >
          {tech.name}
        </span>

        {/* Experience level indicator */}
        <div
          className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 rounded-full"
          style={{
            width: `${tech.experience_level * 0.6}%`,
            background: categoryColor,
            opacity: 0.8,
          }}
        />
      </motion.div>

      {/* Tooltip (fixed + viewport clamped) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: tooltipPos.top,
              left: tooltipPos.left,
            }}
            className={cn(
              'z-[9999] p-4 rounded-xl bg-card border border-border shadow-xl',
              'w-64 max-w-[calc(100vw-1rem)]'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-foreground">{tech.name}</h4>
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{
                  background: `${categoryColor}20`,
                  color: categoryColor,
                }}
              >
                {tech.category}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-3">{tech.description}</p>

            {/* Experience bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Expertise Level</span>
                <span className="font-semibold" style={{ color: categoryColor }}>
                  {tech.experience_level}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${tech.experience_level}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: categoryColor }}
                />
              </div>
            </div>

            {/* Tooltip arrow */}
            {tooltipPos.placement === 'top' ? (
              <div
                className="absolute top-full -mt-1.5 w-3 h-3 rotate-45 bg-card border-r border-b border-border"
                style={{ left: tooltipPos.arrowLeft, transform: 'translateX(-50%) rotate(45deg)' }}
              />
            ) : (
              <div
                className="absolute bottom-full -mb-1.5 w-3 h-3 rotate-45 bg-card border-l border-t border-border"
                style={{ left: tooltipPos.arrowLeft, transform: 'translateX(-50%) rotate(45deg)' }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const TechStackHeatmap = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  const { data: techItems, isLoading } = useQuery({
    queryKey: ['tech-stack'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tech_stack')
        .select('*')
        .eq('status', 'active')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as TechItem[];
    },
  });

  const filteredTech =
    selectedCategory === 'All'
      ? techItems || []
      : (techItems || []).filter((tech) => tech.category === selectedCategory);

  // Sort by experience level
  const sortedTech = [...filteredTech].sort((a, b) => b.experience_level - a.experience_level);

  return (
    <section id="tech-stack" className="py-20 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Tech Stack Heatmap</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            An interactive visualization of my technical expertise. The size and intensity of each bubble
            represents my proficiency level.
          </p>
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            const color = category === 'All' ? 'hsl(var(--primary))' : categoryColors[category];

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  'border-2 hover:scale-105',
                  isSelected ? 'text-primary-foreground shadow-lg' : 'text-foreground hover:shadow-md'
                )}
                style={{
                  background: isSelected ? color : 'transparent',
                  borderColor: color,
                  boxShadow: isSelected ? `0 4px 20px ${color}40` : undefined,
                }}
              >
                {category}
                {category !== 'All' && techItems && (
                  <span className="ml-2 opacity-70">({techItems.filter((t) => t.category === category).length})</span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Heatmap grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div layout className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {sortedTech.map((tech, index) => (
                <TechBubble key={tech.id} tech={tech} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/30" />
            <span>Smaller = Less Experience</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/70" />
            <span>Larger = More Experience</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStackHeatmap;
