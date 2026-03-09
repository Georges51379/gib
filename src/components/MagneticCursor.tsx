import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export const MagneticCursor = () => {
  const isMobile = useIsMobile();
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isMobile) return;

    const onMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const onMouseEnterInteractive = () => setIsHovering(true);
    const onMouseLeaveInteractive = () => setIsHovering(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);

    // Track interactive elements
    const interactives = document.querySelectorAll("a, button, [role='button'], input, textarea, select, [data-magnetic]");
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onMouseEnterInteractive);
      el.addEventListener("mouseleave", onMouseLeaveInteractive);
    });

    // Animation loop
    let raf: number;
    const animate = () => {
      const lerp = 0.15;
      pos.current.x += (target.current.x - pos.current.x) * lerp;
      pos.current.y += (target.current.y - pos.current.y) * lerp;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      // Ring follows slower
      if (ringRef.current) {
        const ringLerp = 0.08;
        const rx = parseFloat(ringRef.current.dataset.x || "-100");
        const ry = parseFloat(ringRef.current.dataset.y || "-100");
        const nx = rx + (target.current.x - rx) * ringLerp;
        const ny = ry + (target.current.y - ry) * ringLerp;
        ringRef.current.dataset.x = String(nx);
        ringRef.current.dataset.y = String(ny);
        ringRef.current.style.transform = `translate(${nx}px, ${ny}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    // Re-bind on DOM changes (for SPAs)
    const observer = new MutationObserver(() => {
      const newInteractives = document.querySelectorAll("a, button, [role='button'], input, textarea, select, [data-magnetic]");
      newInteractives.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnterInteractive);
        el.removeEventListener("mouseleave", onMouseLeaveInteractive);
        el.addEventListener("mouseenter", onMouseEnterInteractive);
        el.addEventListener("mouseleave", onMouseLeaveInteractive);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(raf);
      observer.disconnect();
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnterInteractive);
        el.removeEventListener("mouseleave", onMouseLeaveInteractive);
      });
    };
  }, [isMobile, isVisible]);

  if (isMobile) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference transition-[width,height,opacity] duration-200"
        style={{
          width: isHovering ? 12 : 6,
          height: isHovering ? 12 : 6,
          borderRadius: "50%",
          backgroundColor: "hsl(var(--primary))",
          opacity: isVisible ? 1 : 0,
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        data-x="-100"
        data-y="-100"
        className="fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-[width,height,opacity,border-color] duration-300"
        style={{
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
          borderRadius: "50%",
          border: `1.5px solid hsl(var(--primary) / ${isHovering ? 0.6 : 0.3})`,
          opacity: isVisible ? 1 : 0,
        }}
      />
    </>
  );
};
