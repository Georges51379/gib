import { Mail, Linkedin, Github, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/utils/animations";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { data: settings } = useSiteSettings();

  const socialLinks = [
    { icon: Mail, href: "mailto:contact@gibdev.com", label: "Email" },
    { icon: Linkedin, href: "https://linkedin.com/in/yourusername", label: "LinkedIn" },
    { icon: Github, href: "https://github.com/yourusername", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com/yourusername", label: "Twitter" }
  ];

  return (
    <footer className="relative bg-card">
      {/* Gradient Divider */}
      <div className="h-1 bg-gradient-to-r from-secondary via-primary to-secondary" />
      
      <div className="border-t border-border py-12">
        <div className="container-custom">
          <div className="flex flex-col items-center justify-center space-y-6">
          {/* Logo/Name */}
          <motion.div 
            className="text-2xl font-bold gradient-text drop-shadow-[0_0_12px_rgba(255,215,0,0.3)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {settings?.site_title || "G·B"}
          </motion.div>

          {/* Social Links */}
          <motion.div 
            className="flex gap-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                variants={staggerItem}
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-muted hover:bg-gradient-to-br hover:from-primary hover:to-secondary hover:text-primary-foreground transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]"
              >
                <social.icon className="h-5 w-5" />
              </motion.a>
            ))}
          </motion.div>

          {/* Copyright */}
          <motion.div 
            className="text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p>© {currentYear} {settings?.site_title || "Georges Boutros"}. All rights reserved.</p>
            <p className="mt-2 text-xs">Built with passion and modern technologies</p>
          </motion.div>
        </div>
      </div>
      </div>
    </footer>
  );
};
