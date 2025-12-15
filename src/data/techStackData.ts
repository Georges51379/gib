export interface TechItem {
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'Cloud' | 'AI' | 'Tools' | 'DevOps';
  experienceLevel: number; // 0-100
  description: string;
  icon?: string;
}

export const techStackData: TechItem[] = [
  // Frontend
  { name: 'React', category: 'Frontend', experienceLevel: 95, description: 'Building complex SPAs and component libraries' },
  { name: 'TypeScript', category: 'Frontend', experienceLevel: 90, description: 'Type-safe development across full stack' },
  { name: 'Next.js', category: 'Frontend', experienceLevel: 85, description: 'SSR, SSG, and hybrid rendering applications' },
  { name: 'Tailwind CSS', category: 'Frontend', experienceLevel: 92, description: 'Rapid UI development with utility-first CSS' },
  { name: 'Framer Motion', category: 'Frontend', experienceLevel: 80, description: 'Complex animations and micro-interactions' },
  { name: 'Vue.js', category: 'Frontend', experienceLevel: 70, description: 'Component-based reactive applications' },
  { name: 'HTML/CSS', category: 'Frontend', experienceLevel: 98, description: 'Semantic markup and responsive design' },
  
  // Backend
  { name: 'Node.js', category: 'Backend', experienceLevel: 88, description: 'RESTful APIs and real-time applications' },
  { name: 'Python', category: 'Backend', experienceLevel: 82, description: 'Scripting, automation, and data processing' },
  { name: 'Express.js', category: 'Backend', experienceLevel: 85, description: 'Fast, minimalist web frameworks' },
  { name: 'Deno', category: 'Backend', experienceLevel: 75, description: 'Modern runtime for edge functions' },
  { name: 'GraphQL', category: 'Backend', experienceLevel: 72, description: 'Flexible API queries and mutations' },
  
  // Database
  { name: 'PostgreSQL', category: 'Database', experienceLevel: 88, description: 'Complex queries, RLS, and optimization' },
  { name: 'Supabase', category: 'Database', experienceLevel: 90, description: 'Real-time subscriptions and auth' },
  { name: 'MongoDB', category: 'Database', experienceLevel: 75, description: 'Document-based data modeling' },
  { name: 'Redis', category: 'Database', experienceLevel: 68, description: 'Caching and session management' },
  { name: 'Prisma', category: 'Database', experienceLevel: 78, description: 'Type-safe ORM and migrations' },
  
  // Cloud
  { name: 'Vercel', category: 'Cloud', experienceLevel: 88, description: 'Seamless deployments and edge functions' },
  { name: 'AWS', category: 'Cloud', experienceLevel: 72, description: 'S3, Lambda, EC2, and more' },
  { name: 'Cloudflare', category: 'Cloud', experienceLevel: 70, description: 'CDN, workers, and DNS management' },
  { name: 'Firebase', category: 'Cloud', experienceLevel: 75, description: 'Real-time database and hosting' },
  
  // AI
  { name: 'OpenAI API', category: 'AI', experienceLevel: 85, description: 'GPT integration and prompt engineering' },
  { name: 'LangChain', category: 'AI', experienceLevel: 70, description: 'Building LLM-powered applications' },
  { name: 'Gemini', category: 'AI', experienceLevel: 78, description: 'Multimodal AI integrations' },
  { name: 'Hugging Face', category: 'AI', experienceLevel: 65, description: 'Model deployment and fine-tuning' },
  
  // Tools
  { name: 'Git', category: 'Tools', experienceLevel: 92, description: 'Version control and collaboration' },
  { name: 'VS Code', category: 'Tools', experienceLevel: 95, description: 'Extensions and productivity workflows' },
  { name: 'Figma', category: 'Tools', experienceLevel: 75, description: 'Design systems and prototyping' },
  { name: 'Postman', category: 'Tools', experienceLevel: 85, description: 'API testing and documentation' },
  
  // DevOps
  { name: 'Docker', category: 'DevOps', experienceLevel: 78, description: 'Containerization and orchestration' },
  { name: 'GitHub Actions', category: 'DevOps', experienceLevel: 82, description: 'CI/CD pipelines and automation' },
  { name: 'Linux', category: 'DevOps', experienceLevel: 80, description: 'Server administration and scripting' },
  { name: 'Nginx', category: 'DevOps', experienceLevel: 70, description: 'Reverse proxy and load balancing' },
];

export const categories = ['All', 'Frontend', 'Backend', 'Database', 'Cloud', 'AI', 'Tools', 'DevOps'] as const;
export type Category = typeof categories[number];

export const categoryColors: Record<string, string> = {
  Frontend: 'hsl(var(--primary))',
  Backend: 'hsl(217, 91%, 60%)',
  Database: 'hsl(142, 71%, 45%)',
  Cloud: 'hsl(280, 87%, 60%)',
  AI: 'hsl(350, 89%, 60%)',
  Tools: 'hsl(32, 95%, 55%)',
  DevOps: 'hsl(190, 90%, 50%)',
};
