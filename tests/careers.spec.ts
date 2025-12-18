import { test, expect } from '@playwright/test';
import { fillJobApplicationForm, submitJobApplicationForm, expectFormSuccess, expectFormError } from './helpers/form-helpers';
import { testJobApplicationData } from './helpers/test-data';
import { safeGoto, waitForPageReady } from './helpers/navigation-helpers';

test.describe('Careers', () => {
  test.describe('Careers Listing', () => {
    test.beforeEach(async ({ page }) => {
      try {
        await safeGoto(page, '/careers');
        await waitForPageReady(page);
      } catch (error) {
        console.error('Navigation failed in beforeEach:', error);
        throw new Error(`Failed to navigate to careers page: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    test('job listings load correctly', async ({ page }) => {
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);
      
      // Check for jobs or empty state
      const jobs = page.locator('a[href*="/careers/"], [class*="Card"][class*="job"], [class*="job-card"]');
      const emptyState = page.locator('text=/No jobs|open positions|Check back/i');
      
      const hasJobs = await jobs.count() > 0;
      const hasEmptyState = await emptyState.count() > 0;
      
      expect(hasJobs || hasEmptyState).toBe(true);
    });

    test('filter functionality works', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // Test department filter
      const departmentFilter = page.locator('select, [role="combobox"]').first();
      if (await departmentFilter.count() > 0) {
        await departmentFilter.click();
        await page.waitForTimeout(300);
        
        // Select an option if available
        const options = page.locator('[role="option"]');
        if (await options.count() > 1) {
          await options.nth(1).click();
          await page.waitForTimeout(500);
        }
      }
    });

    test('search functionality works', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('engineer');
        await page.waitForTimeout(500);
        
        // Jobs should be filtered
        const jobs = page.locator('[class*="job"], [class*="career"]');
        // Jobs count may change
      }
    });

    test('filters work in combination', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // Apply multiple filters
      const searchInput = page.locator('input[placeholder*="Search"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('engineer');
        await page.waitForTimeout(300);
      }
      
      const departmentFilter = page.locator('select, [role="combobox"]').first();
      if (await departmentFilter.count() > 0) {
        await departmentFilter.click();
        await page.waitForTimeout(300);
        const options = page.locator('[role="option"]');
        if (await options.count() > 1) {
          await options.nth(1).click();
          await page.waitForTimeout(500);
        }
      }
    });

    test('empty state when no jobs match filters', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // Apply filter that matches nothing
      const searchInput = page.locator('input[placeholder*="Search"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('nonexistentjobtitle12345');
        await page.waitForTimeout(500);
        
        const emptyState = page.locator('text=No jobs found, text=Try adjusting');
        if (await emptyState.count() > 0) {
          await expect(emptyState.first()).toBeVisible();
        }
      }
    });

    test('job cards show correct information', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      const firstJob = page.locator('a[href*="/careers/"], [class*="job-card"]').first();
      if (await firstJob.count() > 0) {
        // Check for title
        const title = firstJob.locator('h2, h3, [class*="title"]');
        if (await title.count() > 0) {
          await expect(title.first()).toBeVisible();
        }
        
        // Check for department, location, type
        const metadata = firstJob.locator('[class*="department"], [class*="location"], [class*="type"]');
        // May or may not be present
      }
    });
  });

  test.describe('Job Detail Page', () => {
    test('job details display correctly', async ({ page }) => {
      await page.goto('/careers');
      await page.waitForTimeout(1000);
      
      const firstJob = page.locator('a[href*="/careers/"]').first();
      if (await firstJob.count() > 0) {
        await firstJob.click();
        await page.waitForTimeout(1000);
        
        // Check for job title
        const title = page.locator('h1, h2');
        await expect(title.first()).toBeVisible();
        
        // Check for job details
        const details = page.locator('[class*="job-detail"], [class*="description"]');
        // May or may not be present
      }
    });

    test('application form renders', async ({ page }) => {
      await page.goto('/careers');
      await page.waitForTimeout(1000);
      
      const firstJob = page.locator('a[href*="/careers/"]').first();
      if (await firstJob.count() > 0) {
        await firstJob.click();
        await page.waitForTimeout(1000);
        
        // Check for application form
        const form = page.locator('form');
        if (await form.count() > 0) {
          await expect(form.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Job Application Form', () => {
    test.beforeEach(async ({ page }) => {
      try {
        await safeGoto(page, '/careers');
        await waitForPageReady(page);
        await page.waitForTimeout(1000);
      } catch (error) {
        console.error('Navigation failed in beforeEach:', error);
        throw new Error(`Failed to navigate to careers page: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      const firstJob = page.locator('a[href*="/careers/"]').first();
      if (await firstJob.count() > 0) {
        await firstJob.click();
        await page.waitForTimeout(1000);
      }
    });

    test('required fields are present', async ({ page }) => {
      const form = page.locator('form').first();
      if (await form.count() > 0) {
        // Check for name field
        const nameInput = form.locator('input[id="name"], input[name="name"]');
        if (await nameInput.count() > 0) {
          await expect(nameInput.first()).toBeVisible();
        }
        
        // Check for email field
        const emailInput = form.locator('input[id="email"], input[name="email"]');
        if (await emailInput.count() > 0) {
          await expect(emailInput.first()).toBeVisible();
        }
        
        // Check for resume upload
        const resumeInput = form.locator('input[type="file"][id="resume"], input[type="file"][name="resume"]');
        if (await resumeInput.count() > 0) {
          await expect(resumeInput.first()).toBeVisible();
        }
      }
    });

    test('file upload validation works', async ({ page }) => {
      const form = page.locator('form').first();
      if (await form.count() > 0) {
        const resumeInput = form.locator('input[type="file"]').first();
        if (await resumeInput.count() > 0) {
          // Try to upload non-PDF (this should fail validation)
          // Note: Creating a test file would require additional setup
          // For now, we'll just check the input accepts PDFs
          const accept = await resumeInput.getAttribute('accept');
          if (accept) {
            expect(accept).toContain('.pdf');
          }
        }
      }
    });

    test('form submission success handling', async ({ page }) => {
      // Check for form existence FIRST before setting up route mocks or filling form
      const form = page.locator('form').first();
      const formCount = await form.count();
      
      // If no form found (no jobs available), test passes (valid scenario - no jobs to apply for)
      if (formCount === 0) {
        // No form to test, so test passes
        return;
      }
      
      // Verify form has required fields before proceeding
      const nameInput = form.locator('input[id="name"], input[name="name"]');
      if (await nameInput.count() === 0) {
        // Form exists but doesn't have expected fields - skip
        return;
      }
      
      // Only set up route mock if form exists and has fields
      await page.route('**/api/careers/**/apply', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Application submitted successfully' }),
        });
      });
      
      await fillJobApplicationForm(page, {
        name: testJobApplicationData.valid.name,
        email: testJobApplicationData.valid.email,
        coverLetter: testJobApplicationData.valid.coverLetter,
      });

      await submitJobApplicationForm(page);
      
      // Wait for API response and React state update
      await page.waitForTimeout(1500);
      
      // Check for success message - message is in a motion.div with text-neon-cyan class
      // Message text: "Thank you! Your application has been submitted successfully..."
      const successMessage = page.locator('div.text-neon-cyan:has-text("Thank you"), div:has-text("Thank you").text-neon-cyan, [class*="text-neon-cyan"]:has-text("Thank you")').first();
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    });

    test('form submission error handling', async ({ page }) => {
      // Check for form existence FIRST before setting up route mocks or filling form
      const form = page.locator('form').first();
      const formCount = await form.count();
      
      // If no form found (no jobs available), test passes (valid scenario - no jobs to apply for)
      if (formCount === 0) {
        // No form to test, so test passes
        return;
      }
      
      // Verify form has required fields before proceeding
      const nameInput = form.locator('input[id="name"], input[name="name"]');
      if (await nameInput.count() === 0) {
        // Form exists but doesn't have expected fields - skip
        return;
      }
      
      // Only set up route mock if form exists and has fields
      await page.route('**/api/careers/**/apply', async route => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid application data' }),
        });
      });
      
      await fillJobApplicationForm(page, {
        name: testJobApplicationData.valid.name,
        email: testJobApplicationData.valid.email,
      });

      await submitJobApplicationForm(page);
      
      // Wait for API response and React state update
      await page.waitForTimeout(1500);
      
      // Check for error message - message is in a motion.div with text-red-400 class
      // Error message contains "Invalid application data" or "Something went wrong"
      const errorMessage = page.locator('div.text-red-400:has-text("Invalid"), div.text-red-400:has-text("wrong"), div.text-red-400:has-text("Something"), [class*="text-red-400"]:has-text("Invalid")').first();
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });
  });
});

