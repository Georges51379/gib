import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  // On initial mount, always start at top and disable browser scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      // @ts-ignore - scrollRestoration may not exist in some browsers
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    const id = setTimeout(() => window.scrollTo(0, 0), 0);
    return () => clearTimeout(id);
  }, []);

  // On route (pathname) change, reset to top
  useEffect(() => {
    window.scrollTo(0, 0);
    const id = setTimeout(() => window.scrollTo(0, 0), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  return null;
};
