import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  contentHtml: string;
}

export const BlogTableOfContents = ({ contentHtml }: BlogTableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>("");

  const headings = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, "text/html");
    const elements = doc.querySelectorAll("h1, h2, h3, h4");
    const items: TocItem[] = [];

    elements.forEach((el, i) => {
      const text = el.textContent?.trim() || "";
      if (!text) return;
      const id = el.id || `heading-${i}`;
      const level = parseInt(el.tagName[1]);
      items.push({ id, text, level });
    });

    return items;
  }, [contentHtml]);

  // Inject IDs into the actual DOM headings inside .project-prose
  useEffect(() => {
    const container = document.querySelector(".project-prose");
    if (!container) return;

    const elements = container.querySelectorAll("h1, h2, h3, h4");
    elements.forEach((el, i) => {
      const matching = headings[i];
      if (matching && !el.id) {
        el.id = matching.id;
      }
    });
  }, [headings]);

  // Scroll-spy via IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="hidden xl:block sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto"
    >
      <div className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <List className="w-4 h-4 text-primary" />
          Table of Contents
        </div>
        <ul className="space-y-1">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`block text-xs py-1 transition-all duration-200 border-l-2 hover:text-primary ${
                  activeId === h.id
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground"
                }`}
                style={{ paddingLeft: `${(h.level - minLevel) * 12 + 12}px` }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
};
