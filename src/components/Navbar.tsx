import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun, Home, User, GraduationCap, Briefcase, DollarSign, MessageSquare, Mail, Github, Linkedin, Twitter } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const navLinks = [
  { name: "Home", href: "#home", icon: Home },
  { name: "About", href: "#about", icon: User },
  { name: "Education", href: "#education", icon: GraduationCap },
  { name: "Projects", href: "#projects", icon: Briefcase },
  { name: "Services", href: "#pricing", icon: DollarSign },
  { name: "Testimonials", href: "#testimonials", icon: MessageSquare },
  { name: "Contact", href: "#contact", icon: Mail },
];

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: settings } = useSiteSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved ? JSON.parse(saved) : true; // Default to dark mode
    }
    return true;
  });

  const logoText = settings?.logo_url 
    ? null 
    : (settings?.site_title || "Georges Boutros").split(' ').map(w => w[0]).join('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Update active section based on scroll position
      const sections = navLinks.map(link => link.href);
      for (const section of sections) {
        const element = document.querySelector(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    // Prevent body scroll when menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    setActiveSection(href);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      handleNavClick("#home");
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "backdrop-blur-lg bg-background/95 dark:bg-black/70 shadow-lg py-2"
          : "bg-transparent py-0"
      }`}
      >
        <div className="container-custom">
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-14 md:h-16' : 'h-16 md:h-20'
          }`}>
            {/* Logo */}
            <motion.a 
              href="/" 
              className="flex items-center space-x-2 text-xl md:text-2xl font-bold gradient-text cursor-pointer"
              onClick={handleLogoClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={settings.site_title || "Logo"} 
                  className="h-8 w-auto" 
                />
              ) : (
                <span>G·B</span>
              )}
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md relative ${
                    activeSection === link.href 
                      ? "text-primary" 
                      : "text-foreground hover:text-primary"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.name}
                  {activeSection === link.href && (
                    <motion.div
                      layoutId="activeSection"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.a>
              ))}
            </div>

            {/* Dark Mode Toggle & Mobile Menu Button */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="transition-transform hover:scale-110 min-h-[44px] min-w-[44px]"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: isDarkMode ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </motion.div>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden relative min-w-[44px] min-h-[44px] text-foreground hover:text-primary"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <motion.span
                    animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                    className="w-full h-0.5 bg-current origin-center"
                  />
                  <motion.span
                    animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                    className="w-full h-0.5 bg-current"
                  />
                  <motion.span
                    animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                    className="w-full h-0.5 bg-current origin-center"
                  />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-background/95 backdrop-blur-md z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-card border-l border-border z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <span className="text-2xl font-bold gradient-text">Menu</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto">
                  <nav className="h-full p-6">
                  <motion.div
                    variants={{
                      open: {
                        transition: { staggerChildren: 0.07, delayChildren: 0.2 }
                      },
                      closed: {
                        transition: { staggerChildren: 0.05, staggerDirection: -1 }
                      }
                    }}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="space-y-1"
                  >
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = activeSection === link.href;
                      
                      return (
                        <motion.a
                          key={link.name}
                          href={link.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(link.href);
                          }}
                          variants={{
                            open: {
                              y: 0,
                              opacity: 1,
                              transition: {
                                y: { stiffness: 1000, velocity: -100 }
                              }
                            },
                            closed: {
                              y: 50,
                              opacity: 0,
                              transition: {
                                y: { stiffness: 1000 }
                              }
                            }
                          }}
                          className={`flex items-center space-x-4 p-4 rounded-lg text-lg font-medium transition-all duration-300 ${
                            isActive 
                              ? "gradient-bg text-white shadow-lg" 
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                          whileHover={{ x: 8 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{link.name}</span>
                        </motion.a>
                      );
                    })}
                  </motion.div>
                  </nav>
                </div>

                {/* Social Links Footer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-6 border-t border-border"
                >
                  <p className="text-sm text-muted-foreground mb-4">Connect with me</p>
                  <div className="flex space-x-4">
                    {socialLinks.map((social) => {
                      const Icon = social.icon;
                      return (
                        <motion.a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-accent hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={social.label}
                        >
                          <Icon className="h-5 w-5" />
                        </motion.a>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
