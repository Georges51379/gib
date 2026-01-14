import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { createPortal } from "react-dom";

const categories = ["All", "Frontend", "Backend", "Database", "Cloud", "AI", "Tools", "DevOps"] as const;
type Category = typeof categories[number];

const categoryColors: Record<string, string> = {
  Frontend: "hsl(210, 100%, 60%)",
  Backend: "hsl(140, 70%, 45%)",
  Database: "hsl(30, 90%, 55%)",
  Cloud: "hsl(190, 90%, 50%)",
  AI: "hsl(270, 70%, 60%)",
  Tools: "hsl(45, 90%, 55%)",
  DevOps: "hsl(0, 70%, 55%)",
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

type TooltipPos = { top: number; left: number; placement: "top" | "bottom" };

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const NAVBAR_SAFE_TOP = 88; // prevent tooltip being hidden under navbar
const VIEWPORT_MARGIN = 12;

const TechBubble = ({ tech, index }: { tech: TechItem; index: number }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<TooltipPos>({ top: 0, left: 0, placement: "top" });

  // Size based on experience level (min 60px, max 120px)
  const size = 60 + (tech.experience_level / 100) * 60;
  const opacity = 0.5 + (tech.experience_level / 100) * 0.5;

  const categoryColor = categoryColors[tech.category] || "hsl(var(--primary))";

  const updatePosition = () => {
    const triggerEl = triggerRef.current;
    const tipEl = tooltipRef.current;
    if (!triggerEl || !tipEl) return;

    const r = triggerEl.getBoundingClientRect();
    const tipRect = tipEl.getBoundingClientRect();

    // Prefer TOP placement if there is enough space
    const spaceAbove = r.top - NAVBAR_SAFE_TOP;
    const spaceBelow = window.innerHeight - r.bottom;

    const placement: "top" | "bottom" =
      spaceAbove >= tipRect.height + 14 ? "top" : "bottom";

    const desiredTop =
      placement === "top"
        ? r.top - tipRect.height - 12
        : r.bottom + 12;

    // Center horizontally on bubble
    const desiredLeft = r.left + r.width / 2 - tipRect.width / 2;

    const top = clamp(
      desiredTop,
      NAVBAR_SAFE_TOP + VIEWPORT_MARGIN,
      window.innerHeight - tipRect.height - VIEWPORT_MARGIN
    );

    const left = clamp(
      desiredLeft,
      VIEWPORT_MARGIN,
      window.innerWidth - tipRect.width - VIEWPORT_MARGIN
    );

    setPos({ top, left, placement });
  };

  // Recompute on open + resize/scroll
  useLayoutEffect(() => {
    if (!open) return;
    // Wait one frame so tooltipRef has correct size
    const raf = requestAnimationFrame(() => updatePosition());
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onResize = () => updatePosition();
    const onScroll = () => updatePosition();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Better mobile behavior: tap toggles tooltip
  const onToggle = () => setOpen((v) => !v);

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
      className="relative"
      ref={triggerRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-label={`${tech.name} tooltip`}
    >
      <motion.div
        className="relative flex items-center justify-center rounded-2xl cursor-pointer overflow-hidden select-none"
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
        {/* Inner glow */}
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

      {/* Tooltip (Portal + fixed positioning) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={tooltipRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "fixed",
                  top: pos.top,
                  left: pos.left,
                  zIndex: 9999,
                }}
                className="w-72 max-w-[calc(100vw-24px)] p-4 rounded-xl bg-card border border-border shadow-xl"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
              >
                <div className="flex items-center justify-between mb-2 gap-3">
                  <h4 className="font-bold text-foreground truncate">{tech.name}</h4>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full shrink-0"
                    style={{
                      background: `${categoryColor}20`,
                      color: categoryColor,
                    }}
                  >
                    {tech.category}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {tech.description}
                </p>

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

                {/* Arrow */}
                <div
                  className={cn(
                    "absolute w-3 h-3 rotate-45 bg-card border-border",
                    pos.placement === "top"
                      ? "top-full -mt-1.5 border-r border-b"
                      : "bottom-full -mb-1.5 border-l border-t"
                  )}
                  style={{
                    left: "50%",
                    transform: "translateX(-50%) rotate(45deg)",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </motion.div>
  );
};

const TechStackHeatmap = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");

  const { data: techItems, isLoading } = useQuery({
    queryKey: ["tech-stack"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tech_stack")
        .select("*")
        .eq("status", "active")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as TechItem[];
    },
  });

  const filteredTech = useMemo(() => {
    const list = techItems || [];
    if (selectedCategory === "All") return list;
    return list.filter((t) => t.category === selectedCategory);
  }, [techItems, selectedCategory]);

  const sortedTech = useMemo(() => {
    return [...filteredTech].sort((a, b) => b.experience_level - a.experience_level);
  }, [filteredTech]);

  return (
    <section id="tech-stack" className="py-20 px-4 relative overflow-hidden">
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
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tech Stack Heatmap
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            An interactive visualization of my technical expertise.
            The size and intensity of each bubble represents my proficiency level.
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
            const color = category === "All" ? "hsl(var(--primary))" : categoryColors[category];

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  "border-2 hover:scale-105",
                  isSelected ? "text-primary-foreground shadow-lg" : "text-foreground hover:shadow-md"
                )}
                style={{
                  background: isSelected ? color : "transparent",
                  borderColor: color,
                  boxShadow: isSelected ? `0 4px 20px ${color}40` : undefined,
                }}
              >
                {category}
                {category !== "All" && techItems && (
                  <span className="ml-2 opacity-70">
                    ({techItems.filter((t) => t.category === category).length})
                  </span>
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
