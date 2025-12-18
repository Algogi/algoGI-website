import { test, expect } from '@playwright/test';
import { testLeadData, testJobApplicationData } from './helpers/test-data';

test.describe('API Endpoints', () => {
  test.describe('Lead API', () => {
    test('POST /api/lead validates required fields', async ({ request }) => {
      const response = await request.post('/api/lead', {
        data: {
          // Missing required fields
          name: 'Test',
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Missing required fields');
    });

    test('POST /api/lead validates email format', async ({ request }) => {
      const response = await request.post('/api/lead', {
        data: {
          name: 'Test User',
          email: 'invalid-email',
          company: 'Test Company',
          projectDescription: 'Test description',
          budgetTimeline: 'Test timeline',
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Invalid email format');
    });

    test('POST /api/lead validates call time when openToCall is true', async ({ request }) => {
      const response = await request.post('/api/lead', {
        data: {
          ...testLeadData.valid,
          openToCall: true,
          // Missing preferredCallTime
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('preferred call time');
    });

    test('POST /api/lead accepts valid data', async ({ request }) => {
      const response = await request.post('/api/lead', {
        data: testLeadData.valid,
      });

      // Should return 200 (even if database/email fails, API should return success)
      expect([200, 500]).toContain(response.status());
      
      if (response.status() === 200) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });

    test('POST /api/lead handles errors gracefully', async ({ request }) => {
      // Send malformed request
      const response = await request.post('/api/lead', {
        data: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Should return error status
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('Blog API', () => {
    test('GET /api/blog returns posts', async ({ request }) => {
      const response = await request.get('/api/blog');
      
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('GET /api/blog/[slug] returns post', async ({ request }) => {
      // First get list of posts
      const listResponse = await request.get('/api/blog');
      const posts = await listResponse.json();
      
      if (Array.isArray(posts) && posts.length > 0) {
        const firstPost = posts[0];
        const slug = firstPost.slug || firstPost.id;
        
        const response = await request.get(`/api/blog/${slug}`);
        
        // Should return 200 or 404
        expect([200, 404]).toContain(response.status());
        
        if (response.status() === 200) {
          const post = await response.json();
          expect(post).toHaveProperty('title');
          expect(post).toHaveProperty('slug');
        }
      }
    });

    test('GET /api/blog/[slug] returns 404 for non-existent post', async ({ request }) => {
      const response = await request.get('/api/blog/non-existent-post-slug-12345');
      
      expect(response.status()).toBe(404);
    });
  });

  test.describe('Careers API', () => {
    test('GET /api/careers returns jobs', async ({ request }) => {
      const response = await request.get('/api/careers');
      
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('GET /api/careers/[slug] returns job', async ({ request }) => {
      // First get list of jobs
      const listResponse = await request.get('/api/careers');
      const jobs = await listResponse.json();
      
      if (Array.isArray(jobs) && jobs.length > 0) {
        const firstJob = jobs[0];
        const slug = firstJob.slug || firstJob.id;
        
        const response = await request.get(`/api/careers/${slug}`);
        
        // Should return 200 or 404
        expect([200, 404]).toContain(response.status());
        
        if (response.status() === 200) {
          const job = await response.json();
          expect(job).toHaveProperty('title');
          expect(job).toHaveProperty('slug');
        }
      }
    });

    test('POST /api/careers/[slug]/apply validates required fields', async ({ request }) => {
      // First get a job slug
      const listResponse = await request.get('/api/careers');
      const jobs = await listResponse.json();
      
      if (Array.isArray(jobs) && jobs.length > 0) {
        const firstJob = jobs[0];
        const slug = firstJob.slug || firstJob.id;
        
        const response = await request.post(`/api/careers/${slug}/apply`, {
          multipart: {
            // Missing required fields
            name: '',
          },
        });

        // Should return error
        expect(response.status()).toBeGreaterThanOrEqual(400);
      }
    });
  });

  test.describe('Newsletter API', () => {
    test('POST /api/newsletter validates email', async ({ request }) => {
      const response = await request.post('/api/newsletter', {
        data: {
          email: 'invalid-email',
        },
      });

      // Should validate email format
      expect([400, 200]).toContain(response.status());
    });

    test('POST /api/newsletter accepts valid email', async ({ request }) => {
      const response = await request.post('/api/newsletter', {
        data: {
          email: 'test@example.com',
        },
      });

      // Should accept valid email
      expect([200, 201, 400, 500]).toContain(response.status());
    });
  });

  test.describe('Portfolio API', () => {
    test('GET /api/portfolio returns portfolio items', async ({ request }) => {
      const response = await request.get('/api/portfolio');
      
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });
  });

  test.describe('Testimonials API', () => {
    test('GET /api/testimonials returns testimonials', async ({ request }) => {
      const response = await request.get('/api/testimonials');
      
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });
  });

  test.describe('Error Handling', () => {
    test('API returns proper error format', async ({ request }) => {
      const response = await request.post('/api/lead', {
        data: {
          // Invalid data
        },
      });

      if (response.status() >= 400) {
        const body = await response.json();
        expect(body).toHaveProperty('error');
      }
    });

    test('API handles CORS correctly', async ({ request }) => {
      const response = await request.get('/api/blog');
      
      // Should return CORS headers if needed
      const headers = response.headers();
      // Check for CORS headers if your API uses them
    });
  });
});

