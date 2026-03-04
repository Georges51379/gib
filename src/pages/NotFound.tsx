import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Page Not Found | Georges Boutros"
        description="The page you're looking for doesn't exist."
        noindex={true}
      />
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">Oops! The page you're looking for doesn't exist.</p>
          <Button asChild size="lg">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Home
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
