-- Insert About Section content
INSERT INTO public.about_section (
  id,
  title,
  subtitle,
  image_url,
  content_intro,
  content_main,
  skills
) VALUES (
  gen_random_uuid(),
  'About Me',
  'Passionate Full-Stack Developer & Data Engineer',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop',
  '<p>I''m a passionate full-stack developer with over 5 years of experience in building scalable web applications and data pipelines. I specialize in modern JavaScript frameworks, cloud architecture, and turning complex problems into elegant solutions.</p>',
  '<p>Throughout my career, I''ve worked with diverse teams and technologies, from startups to enterprise environments. I believe in writing clean, maintainable code and staying current with the latest industry trends.</p><p>My approach combines technical expertise with business acumen, ensuring that every solution I build not only works flawlessly but also delivers real value to users and stakeholders.</p><p>When I''m not coding, you can find me contributing to open-source projects, mentoring junior developers, or exploring new technologies that push the boundaries of what''s possible on the web.</p>',
  '[
    {
      "icon": "Code2",
      "title": "Frontend Development",
      "description": "Expert in React, TypeScript, and modern UI frameworks. I create responsive, accessible interfaces that users love."
    },
    {
      "icon": "Database",
      "title": "Backend Architecture",
      "description": "Proficient in Node.js, Python, and cloud services. I design scalable systems that handle millions of requests."
    },
    {
      "icon": "BarChart3",
      "title": "Data Engineering",
      "description": "Experienced with ETL pipelines, real-time processing, and analytics platforms that drive business insights."
    }
  ]'::jsonb
);

-- Insert Education entries
INSERT INTO public.education (
  id,
  year,
  institution,
  degree,
  description,
  technologies,
  display_order
) VALUES
(
  gen_random_uuid(),
  '2020 - 2022',
  'University of Technology',
  'Master''s Degree in Computer Science',
  '<p>Advanced studies in software engineering, distributed systems, and algorithms. Focused on cloud computing and modern application architecture.</p><p>Thesis: "Optimizing Microservices Performance in Cloud-Native Environments"</p>',
  ARRAY['Python', 'Java', 'Algorithms', 'Cloud Computing', 'Distributed Systems'],
  1
),
(
  gen_random_uuid(),
  '2016 - 2020',
  'Tech University',
  'Bachelor''s Degree in Software Engineering',
  '<p>Comprehensive foundation in computer science fundamentals, including data structures, algorithms, database systems, and software design patterns.</p><p>Senior Project: Full-stack web application for student collaboration</p>',
  ARRAY['JavaScript', 'SQL', 'Data Structures', 'OOP', 'Software Design'],
  2
),
(
  gen_random_uuid(),
  '2023',
  'Amazon Web Services',
  'AWS Certified Solutions Architect - Professional',
  '<p>Professional certification demonstrating comprehensive expertise in designing and deploying dynamically scalable, highly available, fault-tolerant, and reliable applications on AWS.</p>',
  ARRAY['AWS', 'Cloud Architecture', 'DevOps', 'Terraform', 'Kubernetes'],
  3
);

-- Insert Projects
INSERT INTO public.projects (
  id,
  title,
  short_description,
  detailed_description,
  thumbnail_url,
  duration,
  role,
  team_size,
  technologies,
  challenges,
  live_url,
  github_url,
  featured,
  display_order
) VALUES
(
  gen_random_uuid(),
  'E-Commerce Platform',
  'A full-stack e-commerce solution with real-time inventory management, payment processing, and order tracking.',
  '<h2>Project Overview</h2><p>Developed a comprehensive e-commerce platform that handles thousands of daily transactions. The platform features a modern React frontend, Node.js backend, and PostgreSQL database with Redis caching for optimal performance.</p><h2>Key Features</h2><ul><li>Real-time inventory synchronization across multiple warehouses</li><li>Secure payment processing with Stripe integration</li><li>Advanced search with Elasticsearch</li><li>Admin dashboard for order and inventory management</li><li>Automated email notifications and shipping tracking</li></ul><h2>Technical Implementation</h2><p>Built using a microservices architecture with Docker containerization. Implemented CI/CD pipeline with automated testing and deployment to AWS ECS. Used Redis for session management and caching, reducing database load by 60%.</p><h2>Business Impact</h2><ul><li>Processed over $2M in transactions in the first quarter</li><li>Achieved 99.9% uptime</li><li>Reduced cart abandonment rate by 35%</li><li>Page load times under 2 seconds</li></ul>',
  'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop',
  '6 months',
  'Lead Full-Stack Developer',
  '5 developers',
  ARRAY['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis', 'Docker', 'AWS', 'Elasticsearch'],
  '<p>One of the main challenges was handling real-time inventory updates across multiple warehouses while maintaining data consistency. We implemented a distributed locking mechanism using Redis to prevent race conditions during high-traffic periods.</p><p>Another significant challenge was optimizing the search functionality to handle millions of products. We used Elasticsearch with custom analyzers and filters to provide fast, relevant search results.</p>',
  'https://example.com/ecommerce',
  'https://github.com/example/ecommerce',
  true,
  1
),
(
  gen_random_uuid(),
  'Data Analytics Dashboard',
  'Real-time analytics dashboard processing millions of events daily with interactive visualizations.',
  '<h2>Project Overview</h2><p>Created a powerful analytics platform that processes and visualizes large-scale data in real-time. The dashboard provides actionable insights for business decision-making through interactive charts and reports.</p><h2>Key Features</h2><ul><li>Real-time data ingestion from multiple sources</li><li>Custom dashboards with drag-and-drop widgets</li><li>Advanced filtering and segmentation</li><li>Automated report generation and scheduling</li><li>Export to PDF, Excel, and CSV formats</li></ul><h2>Technical Architecture</h2><p>Built a data pipeline using Apache Kafka for stream processing and Apache Spark for batch analytics. The frontend uses React with D3.js for custom visualizations. Data is stored in Google BigQuery for fast analytical queries.</p><h2>Performance Metrics</h2><ul><li>Processing 10M+ events per day</li><li>Query response time under 500ms</li><li>99.95% data accuracy</li><li>Supporting 500+ concurrent users</li></ul>',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
  '4 months',
  'Data Engineer & Frontend Developer',
  '4 developers',
  ARRAY['Python', 'Apache Spark', 'React', 'D3.js', 'Kafka', 'BigQuery', 'Docker', 'GCP'],
  '<p>The primary challenge was designing a scalable data pipeline that could handle millions of events without data loss. We implemented a Lambda architecture combining batch and stream processing to ensure both real-time updates and historical accuracy.</p><p>Another challenge was creating responsive visualizations that could render large datasets smoothly. We implemented virtualization techniques and data sampling strategies to maintain 60fps rendering performance.</p>',
  'https://example.com/analytics',
  NULL,
  true,
  2
),
(
  gen_random_uuid(),
  'AI-Powered Customer Support',
  'Intelligent chatbot system using natural language processing to handle customer inquiries and reduce support costs.',
  '<h2>Project Overview</h2><p>Developed an AI-powered customer support system that uses natural language processing to understand and respond to customer inquiries. The system integrates with existing CRM and ticketing systems to provide seamless support.</p><h2>Key Features</h2><ul><li>Natural language understanding with sentiment analysis</li><li>Multi-language support (10+ languages)</li><li>Automatic ticket creation and routing</li><li>Integration with knowledge base</li><li>Human handoff when needed</li><li>Continuous learning from interactions</li></ul><h2>Technical Implementation</h2><p>Built using Python with TensorFlow for the NLP model, trained on thousands of customer interactions. The frontend uses React with WebSocket connections for real-time chat. Integrated OpenAI API for advanced language understanding.</p><h2>Results</h2><ul><li>Reduced support ticket volume by 40%</li><li>Average response time under 2 seconds</li><li>85% customer satisfaction rate</li><li>Handles 1000+ conversations daily</li></ul>',
  'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=600&fit=crop',
  '3 months',
  'AI Engineer & Full-Stack Developer',
  '3 developers',
  ARRAY['Python', 'TensorFlow', 'React', 'WebSocket', 'OpenAI API', 'MongoDB', 'Docker'],
  '<p>The main challenge was training the NLP model to understand diverse customer inquiries across different contexts. We collected and labeled thousands of historical support tickets and implemented active learning to continuously improve the model.</p><p>Another challenge was handling the transition between bot and human agents smoothly. We developed a confidence scoring system that triggers human handoff when the bot is uncertain about the response.</p>',
  NULL,
  'https://github.com/example/ai-support',
  false,
  3
),
(
  gen_random_uuid(),
  'Fitness Tracking Mobile App',
  'Cross-platform mobile app for tracking workouts, nutrition, and connecting with a fitness community.',
  '<h2>Project Overview</h2><p>Created a comprehensive fitness tracking app that helps users reach their health goals through workout tracking, nutrition logging, and social features. The app provides personalized workout plans and progress analytics.</p><h2>Key Features</h2><ul><li>Custom workout builder and tracking</li><li>Nutrition tracking with barcode scanner</li><li>Progress photos and measurements</li><li>Social feed and challenges</li><li>Integration with Apple Health and Google Fit</li><li>Offline mode for gym environments</li></ul><h2>Technical Details</h2><p>Built with React Native for cross-platform compatibility. Backend uses Node.js with MongoDB for flexible data storage. Implemented Firebase for real-time features and push notifications. Used HealthKit and Google Fit APIs for device integration.</p><h2>User Engagement</h2><ul><li>50,000+ active users</li><li>4.7-star rating on app stores</li><li>70% weekly retention rate</li><li>10M+ workouts logged</li></ul>',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop',
  '5 months',
  'Mobile Developer',
  '4 developers',
  ARRAY['React Native', 'Firebase', 'Node.js', 'MongoDB', 'HealthKit', 'Google Fit', 'Redux'],
  '<p>A major challenge was ensuring smooth offline functionality while maintaining data consistency when back online. We implemented a robust conflict resolution system and optimistic UI updates to provide a seamless experience.</p><p>Performance optimization for the social feed was crucial - we implemented infinite scroll with image lazy loading and implemented a caching strategy that reduced data usage by 50%.</p>',
  'https://example.com/fitness-app',
  NULL,
  false,
  4
);

-- Insert Future Projects (using valid status values: 'Planning' or 'In Development')
INSERT INTO public.future_projects (
  id,
  title,
  description,
  status,
  icon_name,
  features,
  display_order
) VALUES
(
  gen_random_uuid(),
  'AI-Powered Code Review Assistant',
  'An intelligent code review tool that automatically analyzes pull requests, suggests improvements, and detects potential bugs using machine learning.',
  'Planning',
  'Bot',
  ARRAY['Automated code quality analysis', 'Best practices suggestions', 'Security vulnerability detection', 'Performance optimization hints', 'Learning from team patterns'],
  1
),
(
  gen_random_uuid(),
  'Blockchain Supply Chain Platform',
  'A transparent supply chain management system using blockchain technology to track products from manufacturer to consumer.',
  'In Development',
  'Network',
  ARRAY['Immutable product tracking', 'Smart contracts for automation', 'Real-time verification', 'Multi-party collaboration', 'Counterfeit prevention'],
  2
),
(
  gen_random_uuid(),
  'Cloud-Native Microservices Framework',
  'A comprehensive framework for building and deploying microservices with built-in monitoring, auto-scaling, and service mesh capabilities.',
  'Planning',
  'Cloud',
  ARRAY['Auto-scaling services', 'Service mesh integration', 'Built-in monitoring and tracing', 'Zero-downtime deployments', 'Multi-cloud support'],
  3
),
(
  gen_random_uuid(),
  'Real-Time Collaboration Tool',
  'A next-generation collaboration platform combining live document editing, video conferencing, and project management in one seamless interface.',
  'Planning',
  'Users',
  ARRAY['Live document editing', 'Integrated video conferencing', 'Project management tools', 'AI-powered meeting summaries', 'Cross-platform sync'],
  4
);