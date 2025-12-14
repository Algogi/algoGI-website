import { Bot, Brain, BarChart3, Zap, MessageCircle, RefreshCw, Code, Cloud } from "lucide-react";

export interface Service {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  fullDescription: string;
  features: string[];
  benefits: string[];
  useCases: string[];
  Icon: React.ComponentType<{ className?: string }>;
  image: string;
  gradient: string;
}

export const services: Service[] = [
  {
    slug: "ai-agent-development",
    title: "AI Agent Development - Autonomous Intelligence That Evolves",
    shortDescription: "Build adaptive AI agents that learn, decide, and scale autonomously",
    description:
      "AlgoGI engineers intelligent AI agents that operate independently, learning from real-world data to make sophisticated decisions and continuously improve performance.",
    fullDescription:
      "AlgoGI engineers intelligent AI agents that operate independently, learning from real-world data to make sophisticated decisions and continuously improve performance. Our agents handle complex, multi-step workflows with human-like reasoning, adapting to new scenarios without manual retraining. From customer service automation to financial trading systems, we deliver production-ready agents with enterprise-grade reliability, security, and monitoring. Our full lifecycle expertise ensures seamless deployment, continuous optimization, and measurable ROI from day one.",
    features: [
      "Multi-agent systems with collaborative intelligence",
      "Real-time learning and adaptive decision-making",
      "Advanced NLP with contextual memory and reasoning",
      "Production-grade deployment with monitoring & governance",
      "Seamless integration with existing enterprise systems",
    ],
    benefits: [
      "40-60% reduction in operational costs through automation",
      "24/7 intelligent decision-making without human intervention",
      "Continuous performance improvement without manual updates",
      "Scalable intelligence that grows with your data volume",
    ],
    useCases: [
      "Autonomous customer support resolving 85% of queries",
      "Real-time fraud detection preventing millions in losses",
      "Dynamic pricing engines optimizing revenue by 25%",
      "Supply chain agents reducing inventory costs by 30%",
    ],
    Icon: Bot,
    image: "/images/ai-agent-development.png",
    gradient: "from-neon-blue to-neon-cyan",
  },
  {
    slug: "bespoke-ai-platforms",
    title: "Bespoke AI Platforms - Custom Intelligence Built for Your Business",
    shortDescription: "Enterprise-grade AI platforms tailored to your exact requirements",
    description:
      "AlgoGI builds custom AI platforms that integrate seamlessly with your infrastructure while delivering breakthrough capabilities tailored to your industry.",
    fullDescription:
      "AlgoGI builds custom AI platforms that integrate seamlessly with your infrastructure while delivering breakthrough capabilities tailored to your industry. From proprietary ML models to generative AI workflows, we architect platforms that scale from MVP to enterprise while maintaining performance and security. Our platforms include built-in MLOps, governance, and observability, ensuring your AI investments deliver consistent business value across teams and use cases.",
    features: [
      "Custom ML model development and fine-tuning",
      "Generative AI pipelines with content moderation",
      "MLOps platform with automated retraining pipelines",
      "Multi-tenant architecture with role-based access",
      "Real-time inference with sub-100ms latency guarantees",
    ],
    benefits: [
      "3-5x faster AI deployment compared to off-the-shelf solutions",
      "90% reduction in integration time with existing systems",
      "Custom capabilities impossible with generic platforms",
      "Enterprise security and compliance from day one",
    ],
    useCases: [
      "E-commerce personalization platform generating $10M+ revenue",
      "Legal document analysis processing 1M+ pages/month",
      "Healthcare diagnostic platform with 95% accuracy",
      "Manufacturing predictive maintenance saving $2M/year",
    ],
    Icon: Brain,
    image: "/images/bespoke-ai-platforms.png",
    gradient: "from-neon-purple to-neon-pink",
  },
  {
    slug: "ai-strategy-consulting",
    title: "AI Strategy Consulting - From Vision to $ROI Reality",
    shortDescription: "Proven frameworks to prioritize AI investments and measure success",
    description:
      "AlgoGI helps executives build AI strategies that deliver measurable business outcomes, not just proof-of-concepts.",
    fullDescription:
      "AlgoGI helps executives build AI strategies that deliver measurable business outcomes, not just proof-of-concepts. Our consultants combine technical depth with business acumen to identify high-impact use cases, create prioritized roadmaps, and establish success metrics. We specialize in bridging the gap between C-suite vision and engineering execution, ensuring every AI dollar generates clear business value.",
    features: [
      "AI maturity assessment across 50+ capability dimensions",
      "Business-case-first prioritization framework",
      "Technical feasibility scoring and risk analysis",
      "ROI modeling with 3-year projections",
      "Change management and organizational readiness",
    ],
    benefits: [
      "85% higher success rate for AI initiatives",
      "2-3x faster time-to-value through prioritization",
      "Clear success metrics avoiding scope creep",
      "Executive alignment across business units",
    ],
    useCases: [
      "Fortune 500 retailer: $50M revenue lift roadmap",
      "Healthcare provider: 40% cost reduction strategy",
      "Fintech unicorn: AI governance framework",
      "Manufacturing: Industry 4.0 transformation plan",
    ],
    Icon: BarChart3,
    image: "/images/ai-strategy-consulting.png",
    gradient: "from-neon-cyan to-neon-blue",
  },
  {
    slug: "intelligent-automation",
    title: "Intelligent Automation - AI-Powered Process Transformation",
    shortDescription: "End-to-end automation that learns and continuously improves",
    description:
      "AlgoGI combines RPA, ML, and NLP to create automation systems that handle unstructured data and complex decision-making.",
    fullDescription:
      "AlgoGI combines RPA, ML, and NLP to create automation systems that handle unstructured data and complex decision-making. Unlike traditional RPA, our intelligent automation processes emails, documents, and customer interactions with human-level understanding. We deliver 80%+ automation rates across back-office, customer service, and compliance functions with built-in continuous improvement.",
    features: [
      "Unstructured data processing (PDFs, emails, images)",
      "Cognitive decision engines with 95%+ accuracy",
      "Self-healing automation with anomaly detection",
      "Cross-system orchestration across 50+ applications",
      "ROI tracking dashboard with real-time metrics",
    ],
    benefits: [
      "70-90% automation rates vs 30-40% for traditional RPA",
      "3-6 month payback period on automation investments",
      "Zero-downtime deployments with blue-green strategy",
      "Compliance audit trails for regulated industries",
    ],
    useCases: [
      "Accounts payable: 92% automation, $1.2M annual savings",
      "Customer onboarding: 4-day → 4-hour processing",
      "Claims processing: 87% automation rate",
      "KYC compliance: 95% accuracy, zero false positives",
    ],
    Icon: Zap,
    image: "/images/intelligent-automation.png",
    gradient: "from-neon-pink to-neon-purple",
  },
  {
    slug: "ai-virtual-agents",
    title: "AI Virtual Agents - Enterprise-Grade Conversational Intelligence",
    shortDescription: "Human-like conversations that resolve 85%+ of interactions",
    description:
      "AlgoGI builds virtual agents that understand nuance, maintain context across sessions, and escalate intelligently.",
    fullDescription:
      "AlgoGI builds virtual agents that understand nuance, maintain context across sessions, and escalate intelligently. Our agents achieve 85%+ resolution rates across complex industries by combining advanced NLU, knowledge retrieval, and multi-turn reasoning. Deployable across web, mobile, voice, and messaging channels with full conversation analytics and continuous improvement.",
    features: [
      "Multi-turn reasoning with 30+ turn context memory",
      "Knowledge graph integration for domain expertise",
      "Emotion and intent detection for personalization",
      "Omnichannel deployment (web, mobile, voice, WhatsApp)",
      "Conversation analytics and A/B testing platform",
    ],
    benefits: [
      "85%+ first-contact resolution rates",
      "60% reduction in support costs",
      "24/7 availability across all channels",
      "CSAT scores matching human agents",
    ],
    useCases: [
      "Banking: 87% mortgage inquiry resolution",
      "Healthcare: 82% appointment & prescription handling",
      "E-commerce: 91% order status & returns",
      "Enterprise IT: 84% password reset & troubleshooting",
    ],
    Icon: MessageCircle,
    image: "/images/ai-virtual-agents.png",
    gradient: "from-neon-blue to-neon-purple",
  },
  {
    slug: "ai-model-lifecycle-management",
    title: "AI Model Lifecycle Management - Production AI That Never Degrades",
    shortDescription: "MLOps platform ensuring 99.9% model uptime and accuracy",
    description:
      "AlgoGI manages the complete AI lifecycle from data drift detection to champion/challenger model deployment.",
    fullDescription:
      "AlgoGI manages the complete AI lifecycle from data drift detection to champion/challenger model deployment. Our platform automatically detects performance degradation, triggers retraining, and deploys improved versions with zero downtime. We guarantee 99.9% model uptime and continuous accuracy improvement for mission-critical AI systems.",
    features: [
      "Automated data drift and concept drift detection",
      "Champion/challenger A/B testing framework",
      "Zero-downtime model deployment with traffic shifting",
      "Explainability and compliance reporting",
      "Multi-model governance dashboard",
    ],
    benefits: [
      "99.9% model uptime guarantee",
      "30% accuracy improvement over 12 months",
      "Zero production incidents through canary deployments",
      "Compliance-ready audit trails and explainability",
    ],
    useCases: [
      "Credit risk models: 98.7% accuracy maintained",
      "Demand forecasting: 25% error reduction over time",
      "Fraud detection: Zero false negatives maintained",
      "Personalization: 18% CTR lift through optimization",
    ],
    Icon: RefreshCw,
    image: "/images/ai-model-lifecycle-management.png",
    gradient: "from-neon-cyan to-neon-pink",
  },
  {
    slug: "product-engineering",
    title: "Product Engineering - From 0 to 1M Users Without Breaking",
    shortDescription: "Full-stack teams that ship scalable products at unicorn velocity",
    description:
      "AlgoGI's product engineering squads deliver production systems that handle 1M+ users from day one with zero refactoring.",
    fullDescription:
      "AlgoGI's product engineering squads deliver production systems that handle 1M+ users from day one with zero refactoring. We combine deep systems expertise with modern architecture patterns to build SaaS platforms, mobile apps, and APIs that scale seamlessly. Our teams own the full stack and deliver with unicorn-grade velocity while maintaining enterprise reliability.",
    features: [
      "Architecture designed for 10x growth from day one",
      "Micro-frontends with team ownership and independent scaling",
      "Event-driven architecture with 99.99% durability",
      "Progressive delivery with feature flags and canary releases",
      "Full-stack observability across the entire system",
    ],
    benefits: [
      "Ship 10x faster than traditional development",
      "Zero scalability refactoring as you grow",
      "95%+ deployment success rate",
      "Developer velocity matching top startups",
    ],
    useCases: [
      "SaaS platform: 0 → 2M users in 18 months",
      "Fintech app: 500K TPS payment processing",
      "E-commerce: Black Friday scale without downtime",
      "Healthcare platform: HIPAA-compliant at scale",
    ],
    Icon: Code,
    image: "/images/product-engineering.png",
    gradient: "from-neon-blue to-neon-cyan",
  },
  {
    slug: "cloud-and-platforms",
    title: "Cloud Platforms - Infrastructure That Scales to $1B ARR",
    shortDescription: "Production cloud platforms with FinOps, security, and 99.99% SLA",
    description:
      "AlgoGI builds cloud platforms that support unicorn growth while optimizing costs and maintaining security.",
    fullDescription:
      "AlgoGI builds cloud platforms that support unicorn growth while optimizing costs and maintaining security. Our infrastructure combines FinOps practices with enterprise security and 99.99% uptime guarantees. From multi-region Kubernetes clusters to serverless event platforms, we deliver infrastructure that scales with your revenue while keeping costs predictable.",
    features: [
      "Multi-cloud Kubernetes with automated scaling",
      "FinOps platform with 30%+ cost optimization",
      "Zero-trust security architecture",
      "GitOps with full audit trail and compliance",
      "Chaos engineering for 99.99% resilience",
    ],
    benefits: [
      "30-50% cloud cost reduction through FinOps",
      "99.99% uptime SLA with $100K/month credits",
      "SOC2/HIPAA/GDPR compliance from day one",
      "Scale to $1B ARR without infrastructure forklift",
    ],
    useCases: [
      "SaaS unicorn: $50M ARR on optimized infra",
      "Fintech: PCI-DSS Level 1 compliance",
      "Healthcare: 99.999% uptime for patient data",
      "Gaming: 10M concurrent users, zero downtime",
    ],
    Icon: Cloud,
    image: "/images/cloud-and-platforms.png",
    gradient: "from-neon-cyan to-neon-blue",
  },
  {
    slug: "strategy-sprints",
    title: "Strategy Sprints - 80 Hours That Save You $8M in Wrong Turns",
    shortDescription: "5-day workshops that de-risk your entire technical roadmap",
    description:
      "AlgoGI's strategy sprints compress 6 months of planning into 5 high-intensity days with guaranteed outcomes.",
    fullDescription:
      "AlgoGI's strategy sprints compress 6 months of planning into 5 high-intensity days with guaranteed outcomes. Our battle-tested framework aligns executives, engineers, and product teams on scope, architecture, roadmap, and success metrics. Every sprint delivers production-ready deliverables including technical architecture, team structure, hiring plan, and 18-month roadmap.",
    features: [
      "5-day workshop with 40+ deliverables",
      "Technical architecture validated for 10x scale",
      "Team structure and hiring roadmap",
      "18-month product and technical roadmap",
      "Risk register with mitigation strategies",
    ],
    benefits: [
      "Avoid $5-10M in wrong technical decisions",
      "100% stakeholder alignment guaranteed",
      "Production-ready roadmap in 5 days",
      "Hiring plan that scales with funding rounds",
    ],
    useCases: [
      "Series B SaaS: $8M saved on wrong architecture",
      "Enterprise migration: 6mo → 5 days planning",
      "Startup post-funding: Team structure for 100→500",
      "Digital transformation: Complete strategy validated",
    ],
    Icon: BarChart3,
    image: "/images/strategy-sprints.png",
    gradient: "from-neon-pink to-neon-purple",
  },
];


export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

