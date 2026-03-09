import { useCallback } from "react";

/**
 * Returns a toggle function that performs a circular clip-path reveal
 * animation centered on the click origin when switching themes.
 */
export const useCircularReveal = (toggleTheme: () => void) => {
  const toggle = useCallback(
    (e?: React.MouseEvent) => {
      // Fallback: no View Transition API support or no event
      if (
        !e ||
        !document.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        toggleTheme();
        return;
      }

      const x = e.clientX;
      const y = e.clientY;

      // Calculate the max radius to cover the entire viewport
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = document.startViewTransition(() => {
        toggleTheme();
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    },
    [toggleTheme]
  );

  return toggle;
};
