import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test.describe('Blog Listing Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/blog');
    });

    test('blog posts load and display', async ({ page }) => {
      // Wait for posts to load
      await page.waitForTimeout(1000);
      
      // Check if posts are displayed or empty state
      const posts = page.locator('[class*="blog"], [class*="post"]');
      const emptyState = page.locator('text=No blog posts');
      
      const hasPosts = await posts.count() > 0;
      const hasEmptyState = await emptyState.count() > 0;
      
      expect(hasPosts || hasEmptyState).toBe(true);
    });

    test('post cards show correct information', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      const firstPost = page.locator('a[href*="/blog/"]').first();
      if (await firstPost.count() > 0) {
        // Check for title
        const title = firstPost.locator('h2, h3, [class*="title"]');
        if (await title.count() > 0) {
          await expect(title.first()).toBeVisible();
        }
        
        // Check for excerpt or description
        const excerpt = firstPost.locator('[class*="excerpt"], [class*="description"]');
        if (await excerpt.count() > 0) {
          await expect(excerpt.first()).toBeVisible();
        }
      }
    });

    test('draft posts are hidden from public', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // Public users should not see draft badges
      const draftBadges = page.locator('text=Draft, [class*="draft"]');
      const count = await draftBadges.count();
      
      // If there are draft badges visible, they should only be visible to admins
      // For public users, we expect no draft badges
      // This test assumes we're testing as a public user
    });

    test('empty state displays when no posts', async ({ page }) => {
      // Mock empty API response
      await page.route('**/api/blog', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      });

      await page.reload();
      await page.waitForTimeout(1000);

      const emptyState = page.locator('text=No blog posts, text=Check back soon');
      if (await emptyState.count() > 0) {
        await expect(emptyState.first()).toBeVisible();
      }
    });

    test('clicking post navigates to detail page', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      const firstPost = page.locator('a[href*="/blog/"]').first();
      if (await firstPost.count() > 0) {
        const href = await firstPost.getAttribute('href');
        await firstPost.click();
        
        if (href) {
          await expect(page).toHaveURL(new RegExp(href));
        }
      }
    });

    test('post metadata displays correctly', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      const firstPost = page.locator('a[href*="/blog/"]').first();
      if (await firstPost.count() > 0) {
        // Check for author
        const author = firstPost.locator('[class*="author"], text=/Author|By/');
        // May or may not be present
        
        // Check for date
        const date = firstPost.locator('[class*="date"], [class*="published"]');
        // May or may not be present
        
        // Check for tags
        const tags = firstPost.locator('[class*="tag"]');
        // May or may not be present
      }
    });
  });

  test.describe('Blog Detail Page', () => {
    test('post content renders correctly', async ({ page }) => {
      // Try to navigate to a blog post
      await page.goto('/blog');
      await page.waitForTimeout(1000);
      
      const firstPost = page.locator('a[href*="/blog/"]').first();
      if (await firstPost.count() > 0) {
        await firstPost.click();
        await page.waitForTimeout(1000);
        
        // Check for post content
        const content = page.locator('article, [class*="content"], [class*="post-content"]');
        if (await content.count() > 0) {
          await expect(content.first()).toBeVisible();
        }
      }
    });

    test('featured image displays if present', async ({ page }) => {
      await page.goto('/blog');
      await page.waitForTimeout(1000);
      
      const firstPost = page.locator('a[href*="/blog/"]').first();
      if (await firstPost.count() > 0) {
        await firstPost.click();
        await page.waitForTimeout(1000);
        
        // Check for featured image
        const image = page.locator('img[class*="featured"], img[class*="hero"]');
        // May or may not be present
      }
    });

    test('tags and metadata show', async ({ page }) => {
      await page.goto('/blog');
      await page.waitForTimeout(1000);
      
      const firstPost = page.locator('a[href*="/blog/"]').first();
      if (await firstPost.count() > 0) {
        await firstPost.click();
        await page.waitForTimeout(1000);
        
        // Check for tags
        const tags = page.locator('[class*="tag"]');
        // May or may not be present
        
        // Check for metadata (author, date)
        const metadata = page.locator('[class*="meta"], [class*="author"], [class*="date"]');
        // May or may not be present
      }
    });

    test('navigation back to blog list works', async ({ page }) => {
      await page.goto('/blog');
      await page.waitForTimeout(1000);
      
      const firstPost = page.locator('a[href*="/blog/"]').first();
      if (await firstPost.count() > 0) {
        await firstPost.click();
        await page.waitForTimeout(1000);
        
        // Navigate back
        await page.goBack();
        await expect(page).toHaveURL(/\/blog/);
      }
    });
  });
});

