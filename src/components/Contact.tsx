import { useState, useRef } from "react";
import { Mail, Linkedin, Github, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion, useInView } from "framer-motion";
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem } from "@/utils/animations";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { supabase } from "@/integrations/supabase/client";

export const Contact = () => {
  const { toast } = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name || !formData.email || !formData.message) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      if (executeRecaptcha) {
        try {
          const token = await executeRecaptcha("contact_form");
          const verifyResponse = await supabase.functions.invoke("verify-recaptcha", {
            body: { token },
          });

          if (verifyResponse.error) throw new Error(verifyResponse.error.message);

          const { success, score } = verifyResponse.data;
          if (!success || score < 0.5) {
            toast({
              title: "Verification Failed",
              description: "Bot detection failed. Please try again.",
              variant: "destructive",
            });
            return;
          }
        } catch (error) {
          console.error("reCAPTCHA verification error:", error);
          toast({
            title: "Verification Error",
            description: "Bot verification failed. Please try again.",
            variant: "destructive",
          });
          return;
        }
      } else {
        console.warn("reCAPTCHA not available, proceeding without verification");
      }

      const { error } = await supabase.from("contact_messages").insert([
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });

      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Contact form error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: "boutros.georges513@gmail.com",
      href: "mailto:boutros.georges513@gmail.com?subject=Hello%20Georges!&body=Hi%20Georges%2C%0D%0A%0D%0AI%20would%20like%20to%20discuss%20a%20potential%20project%20with%20you.%0D%0A%0D%0ABest%20regards%2C",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: "Connect with me",
      href: "https://linkedin.com/in/georges-boutros-534960211",
    },
    {
      icon: Github,
      label: "GitHub",
      value: "View my code",
      href: "https://github.com/Georges51379",
    },
  ];

  return (
    <section id="contact" className="section-padding bg-[hsl(var(--section-bg))]" ref={ref}>
      <div className="container-custom">
        <motion.div
          className="text-center mb-16"
          initial={fadeInUp.initial}
          animate={isInView ? fadeInUp.animate : fadeInUp.initial}
          transition={{ duration: 0.6 }}
        >
          <h2 className="gradient-text mb-4">Get In Touch</h2>
          <motion.div
            className="w-20 h-1 gradient-bg mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto">
            Have a project in mind? Let's work together to bring your ideas to life.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={fadeInLeft.initial}
            animate={isInView ? fadeInLeft.animate : fadeInLeft.initial}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold mb-6">Let's Connect</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              I'm always interested in hearing about new projects and opportunities. Whether you have a
              question or just want to say hi, feel free to reach out!
            </p>

            <motion.div
              className="space-y-4"
              variants={staggerContainer}
              initial="initial"
              animate={isInView ? "animate" : "initial"}
            >
              {contactMethods.map((method) => {
                const Icon = method.icon;
                const mailRef = useRef<HTMLAnchorElement | null>(null);

                const handleEmailClick = (e: React.MouseEvent) => {
                  if (method.label === "Email") {
                    e.preventDefault();
                    toast({
                      title: "Opening email client...",
                      description: "Preparing your message to Georges",
                      duration: 2000, // closes after 2 seconds
                    });

                    // Create or reuse a hidden anchor element for reliable Chrome behavior
                    if (mailRef.current) {
                      mailRef.current.click();
                    } else {
                      const a = document.createElement("a");
                      a.href = method.href;
                      a.style.display = "none";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }
                  }
                };

                return (
                  <motion.a
                    key={method.label}
                    href={method.href}
                    ref={method.label === "Email" ? mailRef : undefined}
                    target={method.label === "Email" ? "_self" : "_blank"}
                    rel={method.label !== "Email" ? "noopener noreferrer" : undefined}
                    onClick={handleEmailClick}
                    variants={staggerItem}
                    whileHover={{ x: 8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-lg transition-all hover:shadow-xl hover:border-primary/50 group"
                  >
                    <motion.div
                      className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <Icon className="h-6 w-6 text-primary group-hover:drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]" />
                    </motion.div>
                    <div>
                      <p className="font-semibold">{method.label}</p>
                      <p className="text-sm text-muted-foreground">{method.value}</p>
                    </div>
                  </motion.a>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={fadeInRight.initial}
            animate={isInView ? fadeInRight.animate : fadeInRight.initial}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.6 }}
              >
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.7 }}
              >
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell me about your project..."
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full resize-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full gradient-bg text-white font-semibold relative overflow-hidden group"
                  disabled={isSubmitting}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <motion.div
                      animate={isSubmitting ? {} : { x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Send className="ml-2 h-4 w-4" />
                    </motion.div>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-hover to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
