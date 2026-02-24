import * as Icons from "lucide-react";
import { motion, useInView } from "framer-motion";
import React, { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import { Button } from "@/components/ui/button";

/**
 * Safe preview renderer:
 * - Handles BOTH real HTML (<p>...</p>) and escaped HTML (&lt;p&gt;...&lt;/p&gt;)
 * - Strips tags and returns clean plain text
 * - Prevents XSS (no dangerouslySetInnerHTML)
 */
const toPlainText = (input?: string | null) => {
  if (!input) return "";

  const str = String(input);

  const decoded =
    str.includes("&lt;") || str.includes("&gt;") || str.includes("&amp;")
      ? new DOMParser().parseFromString(str, "text/html").documentElement
          .textContent || str
      : str;

  const text =
    new DOMParser().parseFromString(decoded, "text/html").body.textContent || "";

  return text.replace(/\s+/g, " ").trim();
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export const FutureProjects = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Per-card expand state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpanded = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const { data: futureProjects = [], isLoading } = useQuery({
    queryKey: ["future-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("future_projects")
        .select("*")
        .eq("status", "active")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    // Reduce refetch churn when navigating around
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const iconMap: Record<string, any> = Icons;

  const getStatusColor = (status: string) => {
    return status === "In Development" ? "text-secondary" : "text-primary";
  };

  /**
   * Normalize once:
   * - stable key
   * - clean description
   * - lightweight toggle decision (no DOM measurement)
   */
  const normalized = useMemo(() => {
    return (futureProjects as any[]).map((p) => {
      const key = String(p.id ?? p.title ?? Math.random());
      const clean = toPlainText(p.description);

      // Simple, fast heuristic: only show toggle for "long" text
      const shouldToggle = clean.length > 260;

      return {
        ...p,
        __key: key,
        __cleanDescription: clean,
        __shouldToggle: shouldToggle,
      };
    });
  }, [futureProjects]);

  if (isLoading) {
    return (
      <section
        className="section-padding bg-[hsl(var(--section-bg))]"
        ref={(n) => (sectionRef.current = n as any)}
      >
        <div className="container-custom space-y-8">
          <Skeleton className="h-12 w-64 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="section-padding bg-[hsl(var(--section-bg))]"
      ref={(n) => (sectionRef.current = n as any)}
    >
      <div className="container-custom">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -14 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -14 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="gradient-text mb-4">Future Projects</h2>
          <motion.div
            className="w-20 h-1 gradient-bg mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.75, delay: 0.15 }}
          />
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto">
            Exciting ideas and innovations currently in the works
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {normalized.map((project: any) => {
            const key: string = project.__key;

            const IconComponent =
              iconMap[project.icon_name || "Lightbulb"] || Icons.Lightbulb;

            const isExpanded = !!expanded[key];
            const showToggle = !!project.__shouldToggle;

            return (
              <motion.div
                key={key}
                variants={cardVariants}
                whileHover={{ y: -6 }} // no scale = less repaint
                transition={{ duration: 0.22 }}
                className="p-8 rounded-2xl bg-card border border-border shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-12 w-12 text-primary" />
                  </div>

                  <span
                    className={`text-sm font-semibold ${getStatusColor(
                      project.project_status
                    )}`}
                  >
                    {project.project_status}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-3">{project.title}</h3>

                {/* Description (clamp only when not expanded) */}
                <p
                  id={`future-project-desc-${key}`}
                  className={[
                    "text-muted-foreground leading-relaxed",
                    isExpanded ? "mb-3" : "mb-2 line-clamp-4",
                  ].join(" ")}
                >
                  {project.__cleanDescription}
                </p>

                {showToggle && (
                  <div className="mb-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="px-0 h-auto text-primary hover:underline"
                      onClick={() => toggleExpanded(key)}
                      aria-expanded={isExpanded}
                      aria-controls={`future-project-desc-${key}`}
                    >
                      {isExpanded ? "Show less" : "Show more"}
                    </Button>
                  </div>
                )}

                {/* Features: animate the block, not each <li> */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                >
                  <p className="text-sm font-semibold mb-2">Expected Features:</p>
                  <ul className="space-y-1">
                    {(project.features || []).map(
                      (feature: string, featureIndex: number) => (
                        <li
                          key={`${key}-feature-${featureIndex}`}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      )
                    )}
                  </ul>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};