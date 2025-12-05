/**
 * Portfolio Case Studies Data
 * 
 * This file contains all portfolio items (case studies) displayed on the Portfolio page.
 * To add, remove, or edit portfolio items, simply modify the array below.
 * 
 * INSTRUCTIONS FOR NON-DEVELOPERS:
 * 
 * 1. To ADD a new portfolio item:
 *    - Copy an existing item object (everything between { and },)
 *    - Paste it in the array (before the closing ])
 *    - Update all the fields with your new content
 * 
 * 2. To REMOVE a portfolio item:
 *    - Delete the entire item object (everything between { and }, including the comma)
 * 
 * 3. To EDIT a portfolio item:
 *    - Find the item you want to edit
 *    - Change the text inside the quotes (keep the quotes!)
 * 
 * FIELD DESCRIPTIONS:
 * 
 * - title: The main title of the portfolio item
 * - client: Client name or type (e.g., "AI Solution · SaaS" or "Automation Template · Open Source")
 * - challenge: The problem this solution addresses
 * - solution: Description of the solution provided
 * - results: Array of achievement points (add more by adding new lines with quotes and commas)
 * - metrics: Two key metrics to display
 *   - primary: Main metric value (e.g., "95%")
 *   - primaryLabel: Label for main metric (e.g., "Error Reduction")
 *   - secondary: Secondary metric value
 *   - secondaryLabel: Label for secondary metric
 * - techStack: Technologies used (add more by adding new quoted items with commas)
 * - isTemplate: true for automation templates, false for AI solutions
 * - demoUrl: URL for demo (use "#" if no demo available)
 * - downloadFile: File download information
 *   - type: "pdf" for case studies, "json" for automation templates
 *   - identifier: Unique identifier for the file (used to find the file in Cloud Storage)
 * - heroImage: Image filename in /public/images/ folder (leave as undefined if no custom image)
 */

export interface CaseStudy {
  title: string;
  client: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics: {
    primary: string;
    primaryLabel: string;
    secondary: string;
    secondaryLabel: string;
  };
  techStack: string[];
  isTemplate: boolean;
  demoUrl: string;
  downloadFile: {
    type: "pdf" | "json";
    identifier: string;
  };
  heroImage?: string;
}

export const caseStudies: CaseStudy[] = [
  {
    title: "Customer Data Sync Automation",
    client: "Automation Template · Open Source",
    challenge:
      "Manual data synchronization across multiple platforms leads to errors, delays, and inconsistent customer information.",
    solution:
      "Open-source workflow automation template that automates customer data synchronization across multiple platforms. This template eliminates manual data entry and enables seamless integration between CRM, email marketing, and analytics platforms.",
    results: [
      "95% reduction in sync errors",
      "Real-time data synchronization",
      "Multi-platform integration",
      "Free open-source template available",
    ],
    metrics: {
      primary: "95%",
      primaryLabel: "Error Reduction",
      secondary: "100%",
      secondaryLabel: "Open Source",
    },
    techStack: ["Workflow Automation", "API Integration", "Data Sync"],
    isTemplate: true,
    demoUrl: "#",
    downloadFile: {
      type: "json",
      identifier: "customer-data-sync-automation",
    },
    heroImage: undefined, // Add hero image path here when available (e.g., "customer-data-sync.png")
  },
  {
    title: "AI-Powered Lead Qualification Agent",
    client: "AI Solution · SaaS",
    challenge:
      "Manual lead qualification is time-consuming and inconsistent, leading to missed opportunities and inefficient sales processes.",
    solution:
      "Intelligent AI agent that automatically qualifies leads using natural language processing and machine learning. The agent analyzes customer inquiries, scores leads based on multiple criteria, and routes high-value prospects to sales teams.",
    results: [
      "40% increase in conversion rates",
      "24/7 lead qualification",
      "Automated lead scoring",
      "Reduced sales cycle time",
    ],
    metrics: {
      primary: "40%",
      primaryLabel: "Conversion Increase",
      secondary: "24/7",
      secondaryLabel: "Availability",
    },
    techStack: ["AI Agents", "NLP", "Machine Learning", "Automation"],
    isTemplate: false,
    demoUrl: "#",
    downloadFile: {
      type: "pdf",
      identifier: "ai-powered-lead-qualification-agent",
    },
    heroImage: undefined, // Add hero image path here when available (e.g., "lead-qualification.png")
  },
  {
    title: "Invoice Processing Workflow",
    client: "Automation Template · Open Source",
    challenge:
      "Manual invoice processing takes hours per invoice, is error-prone, and delays financial operations.",
    solution:
      "Free open-source workflow automation template for automated invoice processing. This workflow extracts data from invoices, validates information, routes for approval, and updates accounting systems automatically.",
    results: [
      "99% processing accuracy",
      "Hours to minutes processing time",
      "Automated approval routing",
      "Free template available",
    ],
    metrics: {
      primary: "99%",
      primaryLabel: "Accuracy",
      secondary: "90%",
      secondaryLabel: "Time Saved",
    },
    techStack: ["Workflow Automation", "OCR", "Document Processing", "Invoice Automation"],
    isTemplate: true,
    demoUrl: "#",
    downloadFile: {
      type: "json",
      identifier: "invoice-processing-workflow",
    },
    heroImage: undefined, // Add hero image path here when available (e.g., "invoice-processing.png")
  },
  {
    title: "Intelligent Customer Support Virtual Agent",
    client: "AI Solution · Customer Support",
    challenge:
      "Customer support teams are overwhelmed with routine inquiries, leading to slow response times and high operational costs.",
    solution:
      "Advanced AI virtual agent that handles customer support inquiries with context awareness and natural conversation flow. Built using AlgoGI's AI agent development framework, this solution provides intelligent, automated support.",
    results: [
      "75% automated resolution rate",
      "92% customer satisfaction",
      "24/7 intelligent support",
      "Reduced support costs by 60%",
    ],
    metrics: {
      primary: "75%",
      primaryLabel: "Auto Resolution",
      secondary: "92%",
      secondaryLabel: "Satisfaction",
    },
    techStack: ["AI Virtual Agents", "NLP", "Context Understanding", "Automation"],
    isTemplate: false,
    demoUrl: "#",
    downloadFile: {
      type: "pdf",
      identifier: "intelligent-customer-support-virtual-agent",
    },
    heroImage: undefined, // Add hero image path here when available (e.g., "customer-support-agent.png")
  },
];

