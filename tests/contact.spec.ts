import { test, expect } from '@playwright/test';
import { fillLeadForm, submitLeadForm } from './helpers/form-helpers';
import { testLeadData } from './helpers/test-data';
import { safeGoto, waitForPageReady } from './helpers/navigation-helpers';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await safeGoto(page, '/contact');
      await waitForPageReady(page);
    } catch (error) {
      console.error('Navigation failed in beforeEach:', error);
      throw new Error(`Failed to navigate to contact page: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  test('contact page renders correctly', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/contact/);
    
    // Check for page title or heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('contact form displays', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    const form = page.locator('form').first();
    await expect(form).toBeVisible({ timeout: 5000 });
  });

  test('all form fields are present', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="company"]')).toBeVisible();
    await expect(page.locator('textarea[name="projectDescription"]')).toBeVisible();
    await expect(page.locator('textarea[name="budgetTimeline"]')).toBeVisible();
  });

  test('form submission works', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    
    // Mock successful API response
    await page.route('**/api/lead', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Lead submitted successfully' }),
      });
    });

    await fillLeadForm(page, testLeadData.valid);
    
    // Wait for API response and form submission to complete
    const [response] = await Promise.all([
      page.waitForResponse('**/api/lead'),
      submitLeadForm(page),
    ]);
    
    // Verify API response was successful
    expect(response.status()).toBe(200);
    
    // Check for success message - use more flexible selector for Firefox compatibility
    const successMessage = page.locator('div.text-neon-cyan, div[class*="neon-cyan"]').filter({ hasText: /Thank you/i }).first();
    await expect(successMessage).toBeVisible({ timeout: 10000 });
  });

  test('form validation works on contact page', async ({ page }) => {
    await submitLeadForm(page);
    
    // Check for validation errors
    const nameInput = page.locator('input[name="name"]');
    const validity = await nameInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(validity).toBe(false);
  });
});

