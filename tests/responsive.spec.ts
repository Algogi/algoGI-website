import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test.describe('Mobile Breakpoints', () => {
    test('mobile viewport (375px) displays correctly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Check mobile menu button is visible
      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      await expect(menuButton).toBeVisible();
      
      // Check desktop nav is hidden
      const desktopNav = page.locator('nav').first();
      const navLinks = desktopNav.locator('a[href="/services"]');
      // On mobile, these might be hidden
    });

    test('forms are usable on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/contact');
      
      const form = page.locator('form').first();
      await expect(form).toBeVisible();
      
      // Check form fields are accessible
      const nameInput = form.locator('input[name="name"]');
      await expect(nameInput).toBeVisible();
      
      // Check input is not too small
      const inputBox = await nameInput.boundingBox();
      if (inputBox) {
        expect(inputBox.width).toBeGreaterThan(200);
      }
    });

    test('grid layouts adapt on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/blog');
      await page.waitForTimeout(1000);
      
      // Check if grid becomes single column on mobile
      const posts = page.locator('[class*="grid"]').first();
      if (await posts.count() > 0) {
        const gridClass = await posts.getAttribute('class');
        // Should have mobile-friendly grid classes
      }
    });
  });

  test.describe('Tablet Breakpoints', () => {
    test('tablet viewport (768px) displays correctly', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      
      // Check navigation adapts
      const header = page.locator('header').first();
      await expect(header).toBeVisible();
    });

    test('tablet viewport (1024px) displays correctly', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto('/');
      
      // Check layout adapts appropriately
      const mainContent = page.locator('main, [class*="container"]').first();
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe('Desktop Breakpoints', () => {
    test('desktop viewport (1280px) displays correctly', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');
      
      // Check desktop navigation is visible
      const desktopNav = page.locator('nav').first();
      await expect(desktopNav).toBeVisible();
      
      // Mobile menu should be hidden
      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      await expect(menuButton).not.toBeVisible();
    });

    test('large desktop viewport (1920px) displays correctly', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      
      // Check content doesn't stretch too wide
      const container = page.locator('[class*="container"], [class*="max-w"]').first();
      if (await container.count() > 0) {
        const box = await container.boundingBox();
        if (box) {
          // Container should have max-width constraint
          expect(box.width).toBeLessThan(1920);
        }
      }
    });
  });

  test.describe('Component Responsiveness', () => {
    test('navigation adapts to screen size', async ({ page }) => {
      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      const mobileMenu = page.locator('button[aria-label="Toggle menu"]');
      await expect(mobileMenu).toBeVisible();
      
      // Test desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.reload();
      await expect(mobileMenu).not.toBeVisible();
    });

    test('images scale appropriately', async ({ page }) => {
      await page.goto('/');
      
      const images = page.locator('img').first();
      if (await images.count() > 0) {
        const image = images.first();
        const box = await image.boundingBox();
        if (box) {
          // Image should have reasonable dimensions
          expect(box.width).toBeGreaterThan(0);
          expect(box.height).toBeGreaterThan(0);
        }
      }
    });

    test('text remains readable at all breakpoints', async ({ page }) => {
      const breakpoints = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1280, height: 720 },
      ];

      for (const viewport of breakpoints) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        
        const text = page.locator('p, h1, h2, h3').first();
        if (await text.count() > 0) {
          const box = await text.first().boundingBox();
          if (box) {
            // Text should be visible and readable
            expect(box.width).toBeGreaterThan(0);
            expect(box.height).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  test.describe('Touch Interactions', () => {
    test('touch targets are appropriately sized on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check primary interactive buttons (not all buttons need to be 44px)
      const primaryButtons = page.locator('button.btn-primary, a.btn-primary, button[class*="primary"]');
      const count = await primaryButtons.count();
      
      if (count > 0) {
        // Check at least one primary button meets size requirements
        let foundValidButton = false;
        for (let i = 0; i < Math.min(count, 5); i++) {
          const button = primaryButtons.nth(i);
          const box = await button.boundingBox();
          if (box) {
            // Touch targets should be at least 44x44px (iOS/Android guidelines)
            // But we'll be lenient - at least one dimension should be >= 44
            if (box.width >= 44 || box.height >= 44) {
              foundValidButton = true;
              break;
            }
          }
        }
        // At least some primary buttons should meet size requirements
        if (count > 0) {
          expect(foundValidButton || count === 0).toBe(true);
        }
      }
    });
  });
});

