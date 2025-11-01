import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Index from "./pages/Index";
import ProjectDetail from "./pages/ProjectDetail";
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
import Maintenance from "./pages/Maintenance";

const queryClient = new QueryClient();

const AppContent = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const location = useLocation();

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
      <LoadingScreen />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
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
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
