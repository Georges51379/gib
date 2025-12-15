import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar, ChevronDown, ExternalLink, Sparkles, Code, Server, GraduationCap, Bot, Loader2 } from 'lucide-react';

type TimelineCategory = 'all' | 'frontend' | 'backend' | 'ai-automation' | 'education';

interface TimelineEntry {
  id: string;
  year: string;
  month: string | null;
  title: string;
  description: string;
  skills: string[];
  category: string;
  project_link: string | null;
  icon: string | null;
  display_order: number;
  status: string;
}

const timelineCategories = [
  { id: 'all' as const, label: 'All' },
  { id: 'frontend' as const, label: 'Frontend Growth' },
  { id: 'backend' as const, label: 'Backend Growth' },
  { id: 'ai-automation' as const, label: 'AI & Automation' },
  { id: 'education' as const, label: 'Education' },
];

const categoryIcons: Record<string, typeof Code> = {
  frontend: Code,
  backend: Server,
  'ai-automation': Bot,
  education: GraduationCap,
};

const categoryColors: Record<string, string> = {
  frontend: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  backend: 'bg-green-500/20 text-green-400 border-green-500/30',
  'ai-automation': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  education: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const categoryDotColors: Record<string, string> = {
  frontend: 'bg-blue-500',
  backend: 'bg-green-500',
  'ai-automation': 'bg-purple-500',
  education: 'bg-yellow-500',
};

interface TimelineItemProps {
  entry: TimelineEntry;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const TimelineItem = ({ entry, index, isExpanded, onToggle }: TimelineItemProps) => {
  const Icon = categoryIcons[entry.category] || Code;
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex items-center gap-4 md:gap-8"
    >
      {/* Desktop: Alternating layout */}
      <div className={cn(
        'hidden md:flex md:w-1/2 md:justify-end',
        !isEven && 'md:order-2 md:justify-start'
      )}>
        <motion.div
          layout
          onClick={onToggle}
          className={cn(
            'relative w-full max-w-md p-5 rounded-xl cursor-pointer transition-all duration-300',
            'bg-card/50 backdrop-blur-sm border border-border/50',
            'hover:bg-card/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
            isExpanded && 'bg-card/80 border-primary/40 shadow-xl shadow-primary/10'
          )}
        >
          {/* Category badge */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className={cn('text-xs', categoryColors[entry.category])}>
              <Icon className="w-3 h-3 mr-1" />
              {entry.category.replace('-', ' ')}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {entry.month && `${entry.month} `}{entry.year}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            {entry.title}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </h3>

          {/* Expanded content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {entry.description}
                </p>
                
                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {entry.skills.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="secondary"
                      className="text-xs bg-secondary/50"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Project link */}
                {entry.project_link && (
                  <a
                    href={entry.project_link}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Project <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preview skills when collapsed */}
          {!isExpanded && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="text-xs text-muted-foreground">
                  {skill}{entry.skills.indexOf(skill) < Math.min(2, entry.skills.length - 1) ? ' •' : ''}
                </span>
              ))}
              {entry.skills.length > 3 && (
                <span className="text-xs text-muted-foreground">+{entry.skills.length - 3} more</span>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Timeline dot and line */}
      <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 flex flex-col items-center z-10">
        <motion.div
          whileHover={{ scale: 1.2 }}
          className={cn(
            'w-4 h-4 rounded-full border-2 border-background shadow-lg',
            categoryDotColors[entry.category] || 'bg-primary',
            isExpanded && 'ring-4 ring-primary/20'
          )}
        />
      </div>

      {/* Mobile layout */}
      <div className="md:hidden pl-10 flex-1">
        <motion.div
          layout
          onClick={onToggle}
          className={cn(
            'relative w-full p-4 rounded-xl cursor-pointer transition-all duration-300',
            'bg-card/50 backdrop-blur-sm border border-border/50',
            'active:bg-card/80',
            isExpanded && 'bg-card/80 border-primary/40'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className={cn('text-xs', categoryColors[entry.category])}>
              <Icon className="w-3 h-3 mr-1" />
              {entry.category.replace('-', ' ')}
            </Badge>
            <span className="text-xs text-muted-foreground">{entry.year}</span>
          </div>

          <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
            {entry.title}
            <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
          </h3>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm text-muted-foreground my-3">{entry.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {entry.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Desktop: Empty space for alternating */}
      <div className={cn('hidden md:block md:w-1/2', isEven && 'md:order-2')} />
    </motion.div>
  );
};

export const SkillsTimeline = () => {
  const [selectedCategory, setSelectedCategory] = useState<TimelineCategory>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['skills-timeline'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills_timeline')
        .select('*')
        .eq('status', 'active')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as TimelineEntry[];
    },
  });

  const filteredData = selectedCategory === 'all'
    ? timelineData || []
    : (timelineData || []).filter(entry => entry.category === selectedCategory);

  return (
    <section id="timeline" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Career Journey</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Skills Growth Timeline
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A visual journey through my professional development, showcasing key milestones and skill acquisitions
          </p>
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-12 md:mb-16"
        >
          {timelineCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                'border border-border/50 hover:border-primary/50',
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card/80'
              )}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Timeline */}
        <div ref={containerRef} className="relative">
          {/* Vertical line */}
          <div className="absolute left-[22px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

          {/* Timeline items */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8 md:space-y-12">
              <AnimatePresence mode="popLayout">
                {filteredData.map((entry, index) => (
                  <TimelineItem
                    key={entry.id}
                    entry={entry}
                    index={index}
                    isExpanded={expandedId === entry.id}
                    onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* End marker */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="absolute left-[18px] md:left-1/2 md:-translate-x-1/2 -bottom-4 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50"
          />
        </div>

        {/* Stats summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Years Experience', value: '4+' },
            { label: 'Technologies', value: '25+' },
            { label: 'Certifications', value: '3' },
            { label: 'Projects Built', value: '50+' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 rounded-xl bg-card/30 border border-border/30"
            >
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsTimeline;
