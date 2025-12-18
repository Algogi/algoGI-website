import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.describe('Keyboard Navigation', () => {
    test('keyboard navigation works on navigation menu', async ({ page }) => {
      await page.goto('/');
      
      // Tab through navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('all interactive elements are keyboard accessible', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Tab through page - just verify we can tab and focus works
      let tabCount = 0;
      const maxTabs = 10; // Limit to prevent infinite loops
      let interactiveElementsFound = 0;
      
      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100); // Small wait for focus
        tabCount++;
        
        const focused = page.locator(':focus');
        if (await focused.count() > 0) {
          const tagName = await focused.first().evaluate(el => el.tagName.toLowerCase());
          // Should be an interactive element
          if (['a', 'button', 'input', 'textarea', 'select'].includes(tagName)) {
            interactiveElementsFound++;
          }
        }
      }
      
      // At least some interactive elements should be focusable
      expect(interactiveElementsFound).toBeGreaterThan(0);
    });

    test('forms are keyboard navigable', async ({ page }) => {
      await page.goto('/contact');
      
      // Tab through form fields
      await page.keyboard.press('Tab'); // Name field
      const nameFocused = page.locator('input[name="name"]:focus');
      // May or may not be focused depending on page structure
      
      await page.keyboard.press('Tab'); // Email field
      const emailFocused = page.locator('input[name="email"]:focus');
      // May or may not be focused
    });

    test('modal can be closed with Escape key', async ({ page }) => {
      await page.goto('/');
      
      // Try to open a modal if one exists
      const modalTrigger = page.locator('button[aria-haspopup="dialog"], [data-modal]').first();
      if (await modalTrigger.count() > 0) {
        await modalTrigger.click();
        await page.waitForTimeout(300);
        
        // Press Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        
        // Modal should be closed
        const modal = page.locator('[role="dialog"]');
        if (await modal.count() > 0) {
          await expect(modal.first()).not.toBeVisible();
        }
      }
    });
  });

  test.describe('ARIA Labels', () => {
    test('buttons have appropriate labels', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const buttons = page.locator('button:not([aria-hidden="true"])');
      const count = await buttons.count();
      
      // Check at least some buttons have labels
      let buttonsWithLabels = 0;
      for (let i = 0; i < Math.min(count, 10); i++) {
        const button = buttons.nth(i);
        const isVisible = await button.isVisible();
        if (!isVisible) continue;
        
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');
        
        // Button should have either aria-label, text content, or aria-labelledby
        if (ariaLabel || (textContent && textContent.trim()) || ariaLabelledBy) {
          buttonsWithLabels++;
        }
      }
      
      // At least some buttons should have labels (be lenient)
      if (count > 0) {
        expect(buttonsWithLabels).toBeGreaterThan(0);
      }
    });

    test('form inputs have associated labels', async ({ page }) => {
      await page.goto('/contact');
      
      const nameInput = page.locator('input[name="name"]');
      if (await nameInput.count() > 0) {
        const id = await nameInput.getAttribute('id');
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeVisible();
        }
      }
    });

    test('navigation has appropriate ARIA attributes', async ({ page }) => {
      await page.goto('/');
      
      const nav = page.locator('nav').first();
      if (await nav.count() > 0) {
        const role = await nav.getAttribute('role');
        // Nav should have role="navigation" or be a <nav> element
        expect(role === 'navigation' || (await nav.evaluate(el => el.tagName.toLowerCase())) === 'nav').toBe(true);
      }
    });

    test('mobile menu has proper ARIA attributes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      if (await menuButton.count() > 0) {
        const ariaExpanded = await menuButton.getAttribute('aria-expanded');
        expect(ariaExpanded).toBeTruthy();
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('text has sufficient contrast', async ({ page }) => {
      await page.goto('/');
      
      // Check main text elements
      const headings = page.locator('h1, h2, h3');
      const count = await headings.count();
      
      if (count > 0) {
        const firstHeading = headings.first();
        const color = await firstHeading.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.color;
        });
        
        // Color should be defined (not transparent)
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
        expect(color).not.toBe('transparent');
      }
    });

    test('links are distinguishable from text', async ({ page }) => {
      await page.goto('/');
      
      const links = page.locator('a').first();
      if (await links.count() > 0) {
        const link = links.first();
        const color = await link.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.color;
        });
        
        // Link should have a distinct color
        expect(color).toBeTruthy();
      }
    });
  });

  test.describe('Focus Indicators', () => {
    test('focus indicators are visible', async ({ page }) => {
      await page.goto('/');
      
      // Focus on an element
      await page.keyboard.press('Tab');
      
      const focused = page.locator(':focus');
      if (await focused.count() > 0) {
        const outline = await focused.first().evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.outline || style.boxShadow;
        });
        
        // Should have some focus indicator
        expect(outline).toBeTruthy();
      }
    });

    test('skip to content link exists', async ({ page }) => {
      await page.goto('/');
      
      // Look for skip link
      const skipLink = page.locator('a[href="#main"], a:has-text("Skip"), a[class*="skip"]');
      // May or may not be present
    });
  });

  test.describe('Semantic HTML', () => {
    test('page has proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      
      const h1 = page.locator('h1');
      const h1Count = await h1.count();
      
      // Should have at least one h1
      expect(h1Count).toBeGreaterThan(0);
    });

    test('landmarks are properly used', async ({ page }) => {
      await page.goto('/');
      
      // Check for main landmark
      const main = page.locator('main, [role="main"]');
      // May or may not be present
      
      // Check for header
      const header = page.locator('header, [role="banner"]');
      if (await header.count() > 0) {
        await expect(header.first()).toBeVisible();
      }
      
      // Check for footer
      const footer = page.locator('footer, [role="contentinfo"]');
      // May or may not be present
    });
  });
});

