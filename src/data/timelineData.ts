export interface TimelineEntry {
  id: string;
  year: string;
  month?: string;
  title: string;
  description: string;
  skills: string[];
  category: 'frontend' | 'backend' | 'ai-automation' | 'education';
  projectLink?: string;
  icon?: string;
}

export const timelineData: TimelineEntry[] = [
  {
    id: '1',
    year: '2020',
    month: 'January',
    title: 'Started Web Development Journey',
    description: 'Began learning HTML, CSS, and JavaScript fundamentals. Built first static websites and discovered passion for creating interactive experiences.',
    skills: ['HTML', 'CSS', 'JavaScript'],
    category: 'frontend',
  },
  {
    id: '2',
    year: '2020',
    month: 'June',
    title: 'React & Modern Frontend',
    description: 'Dove into React ecosystem, learning component-based architecture, state management, and modern build tools.',
    skills: ['React', 'TypeScript', 'Webpack', 'Tailwind CSS'],
    category: 'frontend',
  },
  {
    id: '3',
    year: '2021',
    month: 'March',
    title: 'Backend Development',
    description: 'Expanded into server-side development with Node.js and Express. Built RESTful APIs and learned database management.',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'REST APIs'],
    category: 'backend',
  },
  {
    id: '4',
    year: '2021',
    month: 'August',
    title: 'Cloud & DevOps Fundamentals',
    description: 'Learned cloud infrastructure, CI/CD pipelines, and containerization for scalable deployments.',
    skills: ['AWS', 'Docker', 'GitHub Actions', 'Vercel'],
    category: 'backend',
  },
  {
    id: '5',
    year: '2022',
    month: 'February',
    title: 'Full-Stack Certification',
    description: 'Completed comprehensive full-stack development certification, validating expertise in modern web technologies.',
    skills: ['Full-Stack Development', 'System Design', 'Best Practices'],
    category: 'education',
  },
  {
    id: '6',
    year: '2022',
    month: 'September',
    title: 'AI & Machine Learning',
    description: 'Started exploring AI/ML technologies, building intelligent features and automation tools.',
    skills: ['Python', 'TensorFlow', 'OpenAI API', 'LangChain'],
    category: 'ai-automation',
  },
  {
    id: '7',
    year: '2023',
    month: 'April',
    title: 'Advanced React Patterns',
    description: 'Mastered advanced React patterns including compound components, render props, and performance optimization.',
    skills: ['React Query', 'Zustand', 'Framer Motion', 'Testing'],
    category: 'frontend',
  },
  {
    id: '8',
    year: '2023',
    month: 'October',
    title: 'AI Integration & Automation',
    description: 'Built AI-powered applications integrating LLMs, RAG systems, and intelligent automation workflows.',
    skills: ['GPT-4', 'Embeddings', 'Vector Databases', 'Automation'],
    category: 'ai-automation',
  },
  {
    id: '9',
    year: '2024',
    month: 'March',
    title: 'Cloud Architecture Certification',
    description: 'Earned cloud architecture certification, demonstrating expertise in scalable, secure cloud solutions.',
    skills: ['Cloud Architecture', 'Security', 'Scalability', 'Microservices'],
    category: 'education',
  },
  {
    id: '10',
    year: '2024',
    month: 'Present',
    title: 'Full-Stack AI Development',
    description: 'Currently building cutting-edge applications combining modern web technologies with AI capabilities.',
    skills: ['Next.js', 'Supabase', 'AI Agents', 'Real-time Systems'],
    category: 'ai-automation',
  },
];

export const timelineCategories = [
  { id: 'all', label: 'All', color: 'hsl(var(--primary))' },
  { id: 'frontend', label: 'Frontend', color: 'hsl(220, 90%, 56%)' },
  { id: 'backend', label: 'Backend', color: 'hsl(142, 76%, 36%)' },
  { id: 'ai-automation', label: 'AI & Automation', color: 'hsl(280, 87%, 53%)' },
  { id: 'education', label: 'Education', color: 'hsl(45, 93%, 47%)' },
] as const;

export type TimelineCategory = typeof timelineCategories[number]['id'];
