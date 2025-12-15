import { useState, useEffect, useCallback } from "react";

type Theme = "dark" | "light";

const THEME_STORAGE_KEY = "theme-preference";
const MANUAL_OVERRIDE_KEY = "theme-manual-override";

const getTimeBasedTheme = (): Theme => {
  const hour = new Date().getHours();
  // Daytime: 8am - 7pm = light, otherwise dark
  return hour >= 8 && hour < 19 ? "light" : "dark";
};

const getSystemPreference = (): Theme => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getSmartDefaultTheme = (): Theme => {
  const systemPref = getSystemPreference();
  const timeBased = getTimeBasedTheme();
  
  // System preference takes priority, then time-based
  if (systemPref === "dark") return "dark";
  return timeBased;
};

export const useSmartTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    
    // Check for manual override first
    const hasManualOverride = localStorage.getItem(MANUAL_OVERRIDE_KEY) === "true";
    if (hasManualOverride) {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "dark" || saved === "light") return saved;
    }
    
    // Use smart default
    return getSmartDefaultTheme();
  });

  const [isManualOverride, setIsManualOverride] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(MANUAL_OVERRIDE_KEY) === "true";
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    
    // Add smooth transition class for theme changes
    document.documentElement.style.transition = "background-color 0.3s ease, color 0.3s ease";
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    if (isManualOverride) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setThemeState(getSmartDefaultTheme());
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isManualOverride]);

  // Toggle theme manually
  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setThemeState(newTheme);
    setIsManualOverride(true);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    localStorage.setItem(MANUAL_OVERRIDE_KEY, "true");
  }, [theme]);

  // Set specific theme
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setIsManualOverride(true);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    localStorage.setItem(MANUAL_OVERRIDE_KEY, "true");
  }, []);

  // Reset to smart default
  const resetToAuto = useCallback(() => {
    setIsManualOverride(false);
    localStorage.removeItem(MANUAL_OVERRIDE_KEY);
    localStorage.removeItem(THEME_STORAGE_KEY);
    setThemeState(getSmartDefaultTheme());
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
    isManualOverride,
    toggleTheme,
    setTheme,
    resetToAuto,
  };
};
