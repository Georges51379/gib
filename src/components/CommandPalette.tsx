import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Home, User, Briefcase, BookOpen, DollarSign, Mail, Wrench, LifeBuoy, Settings, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const pages = [
  { name: "Home", href: "/", icon: Home, keywords: "home landing main" },
  { name: "About", href: "/about", icon: User, keywords: "about me bio" },
  { name: "Projects", href: "/projects", icon: Briefcase, keywords: "projects portfolio work" },
  { name: "Blog", href: "/blog", icon: BookOpen, keywords: "blog articles posts" },
  { name: "Services & Pricing", href: "/services", icon: DollarSign, keywords: "services pricing plans" },
  { name: "Contact", href: "/contact", icon: Mail, keywords: "contact email message" },
  { name: "Quick Rescue", href: "/rescue", icon: LifeBuoy, keywords: "rescue help emergency" },
  { name: "Developer Tools", href: "/dev-tools", icon: Wrench, keywords: "dev tools json base64 uuid" },
];

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: projects } = useQuery({
    queryKey: ['cmd-projects'],
    queryFn: async () => {
      const { data } = await supabase
        .from('projects')
        .select('id, slug, title')
        .eq('status', 'active')
        .order('display_order', { ascending: true })
        .limit(10);
      return data || [];
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const { data: blogPosts } = useQuery({
    queryKey: ['cmd-blog'],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, slug, title')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: open,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((href: string) => {
    setOpen(false);
    navigate(href);
  }, [navigate]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, projects, articles..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <CommandItem
                key={page.href}
                value={`${page.name} ${page.keywords}`}
                onSelect={() => runCommand(page.href)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {page.name}
              </CommandItem>
            );
          })}
        </CommandGroup>
        {projects && projects.length > 0 && (
          <CommandGroup heading="Projects">
            {projects.map((project) => (
              <CommandItem
                key={project.id}
                value={`project ${project.title}`}
                onSelect={() => runCommand(`/projects/${project.slug || project.id}`)}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                {project.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {blogPosts && blogPosts.length > 0 && (
          <CommandGroup heading="Blog Posts">
            {blogPosts.map((post) => (
              <CommandItem
                key={post.id}
                value={`blog ${post.title}`}
                onSelect={() => runCommand(`/blog/${post.slug || post.id}`)}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                {post.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};
