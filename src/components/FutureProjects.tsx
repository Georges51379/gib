import * as Icons from "lucide-react";
import { motion, useInView } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { staggerContainer, staggerItem, fadeInUp } from "@/utils/animations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import { Button } from "@/components/ui/button";

/**
 * Enterprise-safe preview renderer:
 * - Handles BOTH real HTML (<p>...</p>) and escaped HTML (&lt;p&gt;...&lt;/p&gt;)
 * - Strips tags and returns clean plain text
 * - Prevents XSS (no dangerouslySetInnerHTML)
 */
const toPlainText = (input?: string | null) => {
  if (!input) return "";

  const str = String(input);

  // If it's escaped HTML, decode entities first (e.g. &lt;p&gt; -> <p>)
  const decoded =
    str.includes("&lt;") || str.includes("&gt;") || str.includes("&amp;")
      ? new DOMParser().parseFromString(str, "text/html").documentElement
          .textContent || str
      : str;

  // Strip any HTML tags and return only text
  const text =
    new DOMParser().parseFromString(decoded, "text/html").body.textContent || "";

  return text.replace(/\s+/g, " ").trim();
};

export const FutureProjects = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Per-card expand state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpanded = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  // Tracks whether a given card's description actually overflows the clamp
  const [isOverflowing, setIsOverflowing] = useState<Record<string, boolean>>(
    {}
  );

  // Store DOM refs for each description node
  const descRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

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
  });

  const iconMap: Record<string, any> = Icons;

  const getStatusColor = (status: string) => {
    return status === "In Development" ? "text-secondary" : "text-primary";
  };

  // Build stable keys + sanitized descriptions once per fetch
  const normalized = useMemo(() => {
    return (futureProjects as any[]).map((p) => {
      const key = String(p.id ?? p.title);
      return {
        ...p,
        __key: key,
        __cleanDescription: toPlainText(p.description),
      };
    });
  }, [futureProjects]);

  /**
   * Measure overflow accurately:
   * - Only for NON-expanded cards (because expanded is intentionally not clamped)
   * - Uses scrollHeight/clientHeight with a small epsilon to avoid subpixel jitter
   */
  const measureOverflow = React.useCallback(() => {
    const next: Record<string, boolean> = {};

    for (const p of normalized) {
      const key = p.__key as string;
      const el = descRefs.current[key];

      if (!el) continue;

      // If expanded, we don't need the toggle decision based on clamp.
      // But we still keep overflow result in case user collapses again.
      const hasOverflow = el.scrollHeight > el.clientHeight + 2; // epsilon
      next[key] = hasOverflow;
    }

    setIsOverflowing(next);
  }, [normalized]);

  // Measure after render and whenever layout changes
  useEffect(() => {
    // Wait one frame to ensure fonts/layout settle
    const raf = window.requestAnimationFrame(() => {
      measureOverflow();
    });

    return () => window.cancelAnimationFrame(raf);
  }, [measureOverflow, expanded]);

  // Re-measure on resize (responsive) and when fonts load (if supported)
  useEffect(() => {
    const onResize = () => measureOverflow();

    window.addEventListener("resize", onResize);

    // Optional: re-measure when fonts finish loading (prevents false negatives)
    // Safe to call conditionally.
    let fontPromiseCleanup: (() => void) | undefined;
    const anyDoc = document as any;

    if (anyDoc?.fonts?.ready?.then) {
      let cancelled = false;
      anyDoc.fonts.ready.then(() => {
        if (!cancelled) measureOverflow();
      });
      fontPromiseCleanup = () => {
        cancelled = true;
      };
    }

    return () => {
      window.removeEventListener("resize", onResize);
      fontPromiseCleanup?.();
    };
  }, [measureOverflow]);

  // Re-measure when images load inside cards (if any future change adds them)
  // (No-op currently, but enterprise-safe.)
  const handleCardLayoutStable = () => {
    measureOverflow();
  };

  if (isLoading) {
    return (
      <section className="section-padding bg-[hsl(var(--section-bg))]" ref={(n) => (sectionRef.current = n as any)}>
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
        <motion.div
          className="text-center mb-16"
          initial={fadeInUp.initial}
          animate={isInView ? fadeInUp.animate : fadeInUp.initial}
          transition={{ duration: 0.6 }}
        >
          <h2 className="gradient-text mb-4">Future Projects</h2>
          <motion.div
            className="w-20 h-1 gradient-bg mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto">
            Exciting ideas and innovations currently in the works
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          onAnimationComplete={handleCardLayoutStable}
        >
          {normalized.map((project: any, index: number) => {
            const key: string = project.__key;
            const IconComponent =
              iconMap[project.icon_name || "Lightbulb"] || Icons.Lightbulb;

            const isExpanded = !!expanded[key];

            // Toggle should appear ONLY if clamped content overflows
            const showToggle = !!isOverflowing[key];

            return (
              <motion.div
                key={key}
                variants={staggerItem}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-2xl bg-card border border-border shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={
                      isInView
                        ? { scale: 1, rotate: 0 }
                        : { scale: 0, rotate: -180 }
                    }
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  >
                    <IconComponent className="h-12 w-12 text-primary" />
                  </motion.div>

                  <motion.span
                    className={`text-sm font-semibold ${getStatusColor(
                      project.project_status
                    )}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={
                      isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }
                    }
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    {project.project_status}
                  </motion.span>
                </div>

                <h3 className="text-xl font-bold mb-3">{project.title}</h3>

                {/* Description (clamped only when not expanded) */}
                <p
                  ref={(el) => {
                    descRefs.current[key] = el;
                  }}
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

                <div>
                  <p className="text-sm font-semibold mb-2">Expected Features:</p>
                  <ul className="space-y-1">
                    {(project.features || []).map(
                      (feature: string, featureIndex: number) => (
                        <motion.li
                          key={`${key}-feature-${featureIndex}`}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={
                            isInView
                              ? { opacity: 1, x: 0 }
                              : { opacity: 0, x: -10 }
                          }
                          transition={{
                            delay: 0.7 + index * 0.1 + featureIndex * 0.05,
                          }}
                        >
                          <span className="text-primary mt-1">•</span>
                          <span>{feature}</span>
                        </motion.li>
                      )
                    )}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
