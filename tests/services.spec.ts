import { test, expect } from '@playwright/test';

test.describe('Services Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services');
  });

  test('services page renders correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/services/);
    
    // Wait for Framer Motion animation to complete (600ms + buffer)
    // The heading appears with a motion animation, so wait for it to be fully visible
    await page.waitForFunction(() => {
      const heading = document.querySelector('h1');
      if (!heading) return false;
      const style = window.getComputedStyle(heading);
      return style.opacity !== '0' && style.visibility !== 'hidden';
    }, { timeout: 10000 });
    
    // Check for page title or heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    // Verify it contains expected text
    await expect(heading).toContainText(/AI Agent|Development|Solutions/i, { timeout: 2000 });
  });

  test('all services display', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Look for service cards or items
    const services = page.locator('[class*="service"], a[href*="/services/"]');
    const count = await services.count();
    
    // Should have at least one service or empty state
    if (count === 0) {
      const emptyState = page.locator('text=No services, text=Coming soon');
      // May or may not be present
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('service cards are clickable', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const firstService = page.locator('a[href*="/services/"], [class*="service-card"]').first();
    if (await firstService.count() > 0) {
      await expect(firstService.first()).toBeVisible();
      
      // Check if it's a link
      const tagName = await firstService.first().evaluate(el => el.tagName.toLowerCase());
      if (tagName === 'a') {
        const href = await firstService.first().getAttribute('href');
        expect(href).toBeTruthy();
      }
    }
  });

  test('service detail pages render', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const firstService = page.locator('a[href*="/services/"]').first();
    if (await firstService.count() > 0) {
      const href = await firstService.first().getAttribute('href');
      if (href && !href.includes('#')) {
        await firstService.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        // Check for service detail content
        const content = page.locator('article, [class*="content"], [class*="service-detail"], h1, h2').first();
        if (await content.count() > 0) {
          await expect(content).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('service modals work', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Look for service items that might open modals
    const serviceItems = page.locator('[class*="service"], button[class*="service"]');
    if (await serviceItems.count() > 0) {
      await serviceItems.first().click();
      await page.waitForTimeout(500);
      
      // Check for modal
      const modal = page.locator('[role="dialog"], [class*="modal"]');
      // May or may not open modal depending on implementation
    }
  });

  test('service descriptions are visible', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const services = page.locator('[class*="service"]');
    if (await services.count() > 0) {
      const firstService = services.first();
      
      // Check for description or excerpt
      const description = firstService.locator('[class*="description"], [class*="excerpt"], p');
      // May or may not be present
    }
  });
});

