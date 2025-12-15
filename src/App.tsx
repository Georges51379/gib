import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Index from "./pages/Index";
import ProjectDetail from "./pages/ProjectDetail";
<<<<<<< HEAD
=======
import DevTools from "./pages/DevTools";
>>>>>>> c8912d8 (Version 4 added new features and page)
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Settings from "./pages/admin/Settings";
import HeroEditor from "./pages/admin/HeroEditor";
import AboutEditor from "./pages/admin/AboutEditor";
import EducationManager from "./pages/admin/EducationManager";
import ProjectsManager from "./pages/admin/ProjectsManager";
import PricingManager from "./pages/admin/PricingManager";
import FutureProjectsManager from "./pages/admin/FutureProjectsManager";
import ContactInbox from "./pages/admin/ContactInbox";
import TestimonialsManager from "./pages/admin/TestimonialsManager";
<<<<<<< HEAD
import Maintenance from "./pages/Maintenance";
import { SEO } from "./components/SEO";
=======
import Analytics from "./pages/admin/Analytics";
import TechStackManager from "./pages/admin/TechStackManager";
import SkillsTimelineManager from "./pages/admin/SkillsTimelineManager";
import Maintenance from "./pages/Maintenance";
import { SEO } from "./components/SEO";
import { usePageViewTracker } from "./hooks/usePageViewTracker";
>>>>>>> c8912d8 (Version 4 added new features and page)

const queryClient = new QueryClient();

const AppContent = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const location = useLocation();
<<<<<<< HEAD
=======
  
  // Track page views for analytics
  usePageViewTracker();
>>>>>>> c8912d8 (Version 4 added new features and page)

  useEffect(() => {
    if (settings?.site_title) {
      document.title = settings.site_title;
    }
    
    if (settings?.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon_url;
    }
  }, [settings]);

  // Check maintenance mode with explicit redirect logic
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isMaintenancePage = location.pathname === '/maintenance';
  
  // Redirect to maintenance page if mode is enabled
  if (settings?.maintenance_mode === true && !isAdminRoute && !isMaintenancePage) {
    return <Navigate to="/maintenance" replace />;
  }
  
  // Redirect away from maintenance page if mode is disabled
  if (settings?.maintenance_mode === false && isMaintenancePage) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {isAdminRoute && <SEO title="Admin Panel" description="Admin Dashboard" noindex={true} />}
      <LoadingScreen />
      <ScrollToTop />
      <ScrollProgressBar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
<<<<<<< HEAD
=======
          <Route path="/dev-tools" element={<DevTools />} />
>>>>>>> c8912d8 (Version 4 added new features and page)
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/admin/hero" element={<ProtectedRoute><HeroEditor /></ProtectedRoute>} />
          <Route path="/admin/about" element={<ProtectedRoute><AboutEditor /></ProtectedRoute>} />
          <Route path="/admin/education" element={<ProtectedRoute><EducationManager /></ProtectedRoute>} />
          <Route path="/admin/projects" element={<ProtectedRoute><ProjectsManager /></ProtectedRoute>} />
          <Route path="/admin/pricing" element={<ProtectedRoute><PricingManager /></ProtectedRoute>} />
          <Route path="/admin/future" element={<ProtectedRoute><FutureProjectsManager /></ProtectedRoute>} />
          <Route path="/admin/contact" element={<ProtectedRoute><ContactInbox /></ProtectedRoute>} />
          <Route path="/admin/testimonials" element={<ProtectedRoute><TestimonialsManager /></ProtectedRoute>} />
<<<<<<< HEAD
=======
          <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/admin/tech-stack" element={<ProtectedRoute><TechStackManager /></ProtectedRoute>} />
          <Route path="/admin/timeline" element={<ProtectedRoute><SkillsTimelineManager /></ProtectedRoute>} />
>>>>>>> c8912d8 (Version 4 added new features and page)
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
