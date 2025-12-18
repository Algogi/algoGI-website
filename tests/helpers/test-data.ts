/**
 * Test data fixtures for E2E tests
 */

export const testLeadData = {
  valid: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    company: 'Acme Corp',
    projectDescription: 'We need an AI-powered chatbot for customer support.',
    budgetTimeline: 'Budget: $50k - $100k, Timeline: 3-6 months',
    openToCall: false,
  },
  withCall: {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    company: 'Tech Startup Inc',
    projectDescription: 'Looking to build a recommendation system for our e-commerce platform.',
    budgetTimeline: 'Budget: $100k+, Timeline: 6-12 months',
    openToCall: true,
    preferredCallTime: '2024-12-20T10:00',
  },
  invalid: {
    name: '',
    email: 'invalid-email',
    company: '',
    projectDescription: '',
    budgetTimeline: '',
  },
};

export const testJobApplicationData = {
  valid: {
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    coverLetter: 'I am very interested in this position and believe I would be a great fit.',
  },
  invalid: {
    name: '',
    email: 'invalid-email',
  },
};

export const testBlogPost = {
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  excerpt: 'This is a test blog post excerpt.',
  content: '<p>This is the full content of the test blog post.</p>',
  author: 'Test Author',
  tags: ['test', 'automation'],
};

export const testJobPosting = {
  title: 'Senior Software Engineer',
  slug: 'senior-software-engineer',
  department: 'Engineering',
  location: 'Remote',
  type: 'full-time',
  excerpt: 'We are looking for an experienced software engineer.',
};

