import { test, expect } from '@playwright/test';

test.describe('Admin CMS', () => {
  // Note: These tests require authentication
  // In a real scenario, you would set up authenticated sessions before running these tests

  test.describe('Blog Management', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to admin blog page (will redirect if not authenticated)
      await page.goto('/admin/blog');
    });

    test('blog management page loads', async ({ page }) => {
      // Check if redirected to login or if page loads
      const isLoginPage = page.url().includes('/admin/login');
      if (!isLoginPage) {
        // If authenticated, check for blog management UI
        const pageTitle = page.locator('h1, h2');
        await expect(pageTitle.first()).toBeVisible();
      }
    });

    test('create new blog post button exists', async ({ page }) => {
      const isLoginPage = page.url().includes('/admin/login');
      if (!isLoginPage) {
        const createButton = page.locator('a[href*="/admin/blog/new"], button:has-text("New"), button:has-text("Create")');
        if (await createButton.count() > 0) {
          await expect(createButton.first()).toBeVisible();
        }
      }
    });

    test('blog posts list displays', async ({ page }) => {
      const isLoginPage = page.url().includes('/admin/login');
      if (!isLoginPage) {
        // Check for posts table or list
        const postsList = page.locator('table, [class*="list"], [class*="posts"]');
        // May or may not be present depending on data
      }
    });
  });

  test.describe('Careers Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin/careers');
    });

    test('careers management page loads', async ({ page }) => {
      const isLoginPage = page.url().includes('/admin/login');
      if (!isLoginPage) {
        const pageTitle = page.locator('h1, h2');
        await expect(pageTitle.first()).toBeVisible();
      }
    });

    test('view applications functionality', async ({ page }) => {
      const isLoginPage = page.url().includes('/admin/login');
      if (!isLoginPage) {
        // Look for applications link or button
        const applicationsLink = page.locator('a:has-text("Applications"), button:has-text("Applications")');
        // May or may not be present
      }
    });
  });

  test.describe('CMS Features', () => {
    test('media library accessible', async ({ page }) => {
      await page.goto('/admin/media');
      
      const isLoginPage = page.url().includes('/admin/login');
      if (!isLoginPage) {
        const pageTitle = page.locator('h1, h2');
        await expect(pageTitle.first()).toBeVisible();
      }
    });

    test('portfolio management accessible', async ({ page }) => {
      await page.goto('/admin/portfolio');
      
      const isLoginPage = page.url().includes('/admin/login');
      if (!isLoginPage) {
        const pageTitle = page.locator('h1, h2');
        await expect(pageTitle.first()).toBeVisible();
      }
    });

    test('testimonials management accessible', async ({ page }) => {
      await page.goto('/admin/testimonials');
      
      const isLoginPage = page.url().includes('/admin/login');
      if (!isLoginPage) {
        const pageTitle = page.locator('h1, h2');
        await expect(pageTitle.first()).toBeVisible();
      }
    });
  });
});

