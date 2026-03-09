import { useEffect, lazy, Suspense } from "react";
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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { CommandPalette } from "@/components/CommandPalette";
import { MagneticCursor } from "@/components/MagneticCursor";

import { SEO } from "./components/SEO";
import { usePageViewTracker } from "./hooks/usePageViewTracker";

// Lazy-loaded pages
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const DevTools = lazy(() => import("./pages/DevTools"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage"));
const RescuePage = lazy(() => import("./pages/RescuePage"));

// Lazy-loaded admin pages
const Login = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const HeroEditor = lazy(() => import("./pages/admin/HeroEditor"));
const AboutEditor = lazy(() => import("./pages/admin/AboutEditor"));
const EducationManager = lazy(() => import("./pages/admin/EducationManager"));
const ProjectsManager = lazy(() => import("./pages/admin/ProjectsManager"));
const PricingManager = lazy(() => import("./pages/admin/PricingManager"));
const FutureProjectsManager = lazy(() => import("./pages/admin/FutureProjectsManager"));
const ContactInbox = lazy(() => import("./pages/admin/ContactInbox"));
const TestimonialsManager = lazy(() => import("./pages/admin/TestimonialsManager"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const TechStackManager = lazy(() => import("./pages/admin/TechStackManager"));
const SkillsTimelineManager = lazy(() => import("./pages/admin/SkillsTimelineManager"));
const BlogManager = lazy(() => import("./pages/admin/BlogManager"));
const RescueInbox = lazy(() => import("./pages/admin/RescueInbox"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

const AppContent = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const location = useLocation();
  
  usePageViewTracker();

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

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isMaintenancePage = location.pathname === '/maintenance';
  
  if (settings?.maintenance_mode === true && !isAdminRoute && !isMaintenancePage) {
    return <Navigate to="/maintenance" replace />;
  }
  
  if (settings?.maintenance_mode === false && isMaintenancePage) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {isAdminRoute && <SEO title="Admin Panel" description="Admin Dashboard" noindex={true} />}
      <LoadingScreen />
      <ScrollToTop />
      <ScrollProgressBar />
      <CommandPalette />
      <MagneticCursor />
      <Suspense fallback={<PageFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:slug" element={<ProjectDetailPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/rescue" element={<RescuePage />} />
            <Route path="/dev-tools" element={<DevTools />} />
            <Route path="/maintenance" element={<Maintenance />} />
            
            {/* Legacy route redirect */}
            <Route path="/project/:id" element={<ProjectDetailPage />} />
            
            {/* Admin Routes */}
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
            <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/admin/tech-stack" element={<ProtectedRoute><TechStackManager /></ProtectedRoute>} />
            <Route path="/admin/timeline" element={<ProtectedRoute><SkillsTimelineManager /></ProtectedRoute>} />
            <Route path="/admin/blog" element={<ProtectedRoute><BlogManager /></ProtectedRoute>} />
            <Route path="/admin/rescue" element={<ProtectedRoute><RescueInbox /></ProtectedRoute>} />
            
            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
