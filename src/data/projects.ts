export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  technologies: string[];
  challenges: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  detailedDescription: string;
  images: string[];
}

export const projects: Project[] = [
  {
    id: "ecommerce-platform",
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce solution with real-time inventory management and payment processing",
    thumbnail: "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&h=600&fit=crop",
    duration: "6 months",
    technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "Redis", "Docker"],
    challenges: "The primary challenges included optimizing database queries to efficiently handle 100,000+ products while maintaining sub-second search times, implementing a robust real-time inventory synchronization system across multiple warehouses without data conflicts, and designing a scalable microservices architecture that could handle traffic spikes during sales events. We solved these through strategic Redis caching, event-driven architecture with Kafka, and comprehensive load testing before deployment.",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: true,
    detailedDescription: `
      <div class="intro">
        <p class="text-2xl leading-relaxed mb-8">Built a comprehensive e-commerce platform that revolutionizes online shopping with cutting-edge technology and user-centric design. This full-stack solution handles thousands of concurrent users while maintaining sub-second response times and 99.9% uptime.</p>
      </div>

      <h2>Project Overview</h2>
      <p>The platform was developed to address the growing need for a scalable, performant e-commerce solution capable of handling rapid growth. Our goal was to create an intuitive shopping experience while maintaining robust backend infrastructure that could scale seamlessly from hundreds to millions of users.</p>

      <h3>Key Features</h3>
      <ul>
        <li><strong>Real-time Inventory Sync:</strong> Automated inventory management across 50+ warehouses with instant updates and stock alerts</li>
        <li><strong>Secure Payment Gateway:</strong> Integrated Stripe with support for multiple payment methods, currencies, and subscription billing</li>
        <li><strong>Intelligent Search:</strong> Elasticsearch-powered search with autocomplete, filters, and personalized recommendations</li>
        <li><strong>Order Tracking:</strong> Real-time order status updates with SMS and email notifications at every stage</li>
        <li><strong>Analytics Dashboard:</strong> Comprehensive admin panel with sales metrics, user behavior analysis, and inventory insights</li>
      </ul>

      <h3>Technical Architecture</h3>
      <ul>
        <li><strong>Microservices Design:</strong> Independently deployable services for orders, inventory, payments, and user management</li>
        <li><strong>Performance Optimization:</strong> Redis caching layer reducing database queries by 70% and API response times to under 100ms</li>
        <li><strong>Quality Assurance:</strong> Comprehensive test suite with 90% code coverage including unit, integration, and E2E tests</li>
        <li><strong>DevOps Pipeline:</strong> Automated CI/CD with Docker containerization and Kubernetes orchestration for zero-downtime deployments</li>
        <li><strong>Database Design:</strong> PostgreSQL with optimized indexing and query patterns handling 100k+ products efficiently</li>
      </ul>

      <div class="project-callout success">
        <h4>Impact & Results</h4>
        <ul>
          <li>Processed over $2M in transactions within the first 6 months</li>
          <li>Achieved 98% customer satisfaction rating</li>
          <li>Reduced cart abandonment rate by 35% through UX optimizations</li>
          <li>Scaled to support 10k+ concurrent users with 99.9% uptime</li>
        </ul>
      </div>

      <h3>Development Process</h3>
      <p>The project followed an agile methodology with two-week sprints. We started with extensive user research and wireframing, then moved into iterative development with continuous stakeholder feedback. Performance testing and optimization were integrated throughout the development cycle rather than being an afterthought.</p>
    `,
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
    ]
  },
  {
    id: "data-analytics-dashboard",
    title: "Data Analytics Dashboard",
    description: "Real-time analytics dashboard processing millions of events with interactive visualizations",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    duration: "4 months",
    technologies: ["Python", "Apache Spark", "React", "D3.js", "Kafka", "BigQuery"],
    challenges: "Building a system capable of processing over 1 million events per hour with sub-second latency required careful architectural planning. The main challenges were designing fault-tolerant ETL pipelines that could handle both streaming and batch data, optimizing BigQuery costs while maintaining query performance, and creating intuitive visualizations for complex datasets. We implemented a lambda architecture, cost-optimized partitioning strategies, and conducted extensive user testing to refine the UI.",
    liveUrl: "https://example.com",
    featured: true,
    detailedDescription: `
      <div class="intro">
        <p class="text-2xl leading-relaxed mb-8">Engineered a cutting-edge data analytics platform that processes millions of events per hour, transforming raw data streams into actionable business intelligence. This system empowers teams to make data-driven decisions with real-time insights and interactive visualizations.</p>
      </div>

      <h2>The Challenge</h2>
      <p>The organization was drowning in data but starving for insights. Manual reporting processes took days to complete, and by the time reports were ready, the data was already outdated. We needed a solution that could process massive data volumes in real-time while remaining accessible to non-technical users.</p>

      <h3>System Architecture</h3>
      <ul>
        <li><strong>Event Streaming Layer:</strong> Apache Kafka ingesting 1M+ events per hour from multiple sources with guaranteed delivery</li>
        <li><strong>Processing Pipeline:</strong> Apache Spark distributed computing cluster with auto-scaling capabilities for peak loads</li>
        <li><strong>Data Warehouse:</strong> Google BigQuery serving as the central repository with petabyte-scale storage and sub-second queries</li>
        <li><strong>Visualization Layer:</strong> Custom React dashboard with D3.js for interactive charts, maps, and real-time metrics</li>
        <li><strong>ETL Workflows:</strong> Automated data transformation pipelines ensuring data quality and consistency</li>
      </ul>

      <h3>Key Features</h3>
      <ul>
        <li><strong>Real-time Dashboards:</strong> Live metrics updating every second with custom alerting for anomaly detection</li>
        <li><strong>Custom Report Builder:</strong> Drag-and-drop interface allowing users to create reports without writing SQL</li>
        <li><strong>Predictive Analytics:</strong> Machine learning models forecasting trends and identifying patterns</li>
        <li><strong>Data Export:</strong> Scheduled reports with PDF, Excel, and CSV export capabilities</li>
      </ul>

      <div class="project-callout success">
        <h4>Business Impact</h4>
        <ul>
          <li>70% reduction in query response time (from 5 minutes to under 15 seconds)</li>
          <li>Automated 15+ manual reporting workflows saving 100+ hours per month</li>
          <li>Increased data accessibility across the organization by 400%</li>
          <li>Enabled $5M in cost savings through data-driven optimizations</li>
        </ul>
      </div>

      <h3>Technical Innovation</h3>
      <p>One of the most challenging aspects was designing an ETL pipeline that could handle both streaming and batch data while maintaining data consistency. We implemented a lambda architecture with both real-time and batch processing layers, allowing us to serve fresh data while ensuring accuracy through batch corrections.</p>

      <blockquote>
        "This platform transformed how we make decisions. What used to take days now happens in seconds."
      </blockquote>
    `,
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=800&fit=crop",
    ]
  },
  {
    id: "ai-chatbot",
    title: "AI-Powered Customer Support",
    description: "Intelligent chatbot using NLP to handle customer inquiries with 85% accuracy",
    thumbnail: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=600&fit=crop",
    duration: "3 months",
    technologies: ["Python", "TensorFlow", "React", "WebSocket", "OpenAI API"],
    challenges: "The biggest challenge was training language models to understand domain-specific terminology while maintaining natural conversation flow. We also needed to handle edge cases gracefully and know when to transfer to human agents. Additionally, integrating with legacy CRM systems required custom API development. We solved these through extensive fine-tuning with domain data, implementing confidence thresholds for escalation, and building robust middleware for system integration.",
    githubUrl: "https://github.com",
    featured: false,
    detailedDescription: `
      <div class="intro">
        <p class="text-2xl leading-relaxed mb-8">Developed an intelligent AI-powered customer support system that handles 85% of inquiries autonomously, reducing response times from hours to seconds while maintaining high customer satisfaction scores.</p>
      </div>

      <h2>Problem Statement</h2>
      <p>Customer support teams were overwhelmed with repetitive inquiries, leading to long wait times and frustrated customers. The challenge was to automate responses without sacrificing the quality of customer interactions or losing the human touch that customers value.</p>

      <h3>AI Implementation</h3>
      <ul>
        <li><strong>Natural Language Processing:</strong> Fine-tuned transformer models for domain-specific understanding with 92% accuracy</li>
        <li><strong>Context Awareness:</strong> Maintains conversation history and user context across multiple sessions</li>
        <li><strong>Intent Recognition:</strong> Identifies user needs and routes to appropriate response flows</li>
        <li><strong>Continuous Learning:</strong> Machine learning pipeline that improves responses based on user feedback</li>
      </ul>

      <h3>Core Features</h3>
      <ul>
        <li><strong>Multi-language Support:</strong> Operates in 12 languages with real-time translation</li>
        <li><strong>Smart Handoff:</strong> Seamlessly transfers complex cases to human agents with full context</li>
        <li><strong>Integration Suite:</strong> Connects with CRM, ticketing system, and knowledge base</li>
        <li><strong>Analytics Dashboard:</strong> Tracks performance metrics, common issues, and customer satisfaction</li>
      </ul>

      <div class="project-callout info">
        <h4>Results</h4>
        <ul>
          <li>85% of inquiries resolved without human intervention</li>
          <li>Average response time reduced from 4 hours to 3 seconds</li>
          <li>Customer satisfaction increased by 40%</li>
          <li>Support costs reduced by 60% while handling 3x more inquiries</li>
        </ul>
      </div>
    `,
    images: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
    ]
  },
  {
    id: "mobile-fitness-app",
    title: "Fitness Tracking Mobile App",
    description: "Cross-platform fitness app with workout plans, progress tracking, and social features",
    thumbnail: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
    duration: "5 months",
    technologies: ["React Native", "Firebase", "Node.js", "MongoDB", "HealthKit"],
    challenges: "Creating a cross-platform app that worked flawlessly on both iOS and Android while integrating with diverse health APIs (HealthKit, Google Fit, various wearables) was complex. We also needed to implement a robust offline-first architecture ensuring data didn't get lost during sync. Performance optimization for smooth animations and quick load times on older devices was crucial. We addressed these through React Native's platform-specific code, careful state management with Redux, and extensive testing on various device types.",
    liveUrl: "https://example.com",
    featured: false,
    detailedDescription: `
      <div class="intro">
        <p class="text-2xl leading-relaxed mb-8">Created a comprehensive fitness tracking platform that combines personalized workout plans, social features, and device integrations to help users achieve their health and fitness goals.</p>
      </div>

      <h2>Vision & Approach</h2>
      <p>The fitness app market is saturated, but most apps fail to maintain user engagement beyond the first month. Our approach focused on creating a sustainable fitness journey through personalization, community, and seamless technology integration.</p>

      <h3>Core Features</h3>
      <ul>
        <li><strong>AI-Powered Workout Plans:</strong> Personalized routines adapting to user progress, preferences, and available equipment</li>
        <li><strong>Progress Analytics:</strong> Comprehensive tracking with visualizations for weight, strength gains, cardio performance, and body measurements</li>
        <li><strong>Social Challenges:</strong> Community features with friend competitions, leaderboards, and group challenges</li>
        <li><strong>Device Integration:</strong> Syncs with Apple Health, Google Fit, and popular wearables for automatic workout logging</li>
        <li><strong>Offline Mode:</strong> Full functionality without internet connection, syncing when back online</li>
      </ul>

      <h3>Technical Implementation</h3>
      <ul>
        <li><strong>Cross-Platform:</strong> React Native ensuring consistent experience on iOS and Android with single codebase</li>
        <li><strong>Backend:</strong> Node.js with MongoDB for flexible data storage and real-time updates</li>
        <li><strong>Push Notifications:</strong> Firebase for workout reminders and achievement notifications</li>
        <li><strong>Real-time Sync:</strong> WebSocket connections for live challenge updates and social features</li>
      </ul>

      <div class="project-callout success">
        <h4>User Engagement</h4>
        <ul>
          <li>50k+ active users within 6 months of launch</li>
          <li>68% user retention rate after 30 days (2x industry average)</li>
          <li>4.8-star rating on both App Store and Google Play</li>
          <li>Users completing average of 4.2 workouts per week</li>
        </ul>
      </div>

      <h3>Design Philosophy</h3>
      <p>Every interaction was designed to be motivating yet not overwhelming. We used gamification principles strategically—celebrating wins without making users feel guilty about missed workouts. The interface adapts to the user's experience level, showing more advanced features as they progress.</p>
    `,
    images: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=800&fit=crop",
    ]
  }
];
