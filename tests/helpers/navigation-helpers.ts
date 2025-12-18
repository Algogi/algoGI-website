import { Page } from '@playwright/test';

/**
 * Helper functions for reliable page navigation
 */

/**
 * Safely navigate to a URL with retry logic and error handling
 * @param page - Playwright page object
 * @param url - URL to navigate to (relative or absolute)
 * @param options - Optional configuration
 * @returns Promise that resolves when navigation succeeds
 */
export async function safeGoto(
  page: Page,
  url: string,
  options?: { retries?: number; timeout?: number }
): Promise<void> {
  const maxRetries = options?.retries ?? 3;
  const timeout = options?.timeout ?? 30000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check if page is still valid before attempting navigation
      if (page.isClosed()) {
        throw new Error('Page has been closed before navigation attempt');
      }

      await page.goto(url, { timeout, waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      return; // Success
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      
      // If page is closed, don't retry
      if (errorMessage.includes('Target page, context or browser has been closed') || 
          errorMessage.includes('Page is closed')) {
        throw new Error(`Page was closed during navigation: ${errorMessage}`);
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`Navigation failed after ${maxRetries} attempts: ${errorMessage}`);
      }

      // Exponential backoff before retry
      const backoffDelay = 1000 * attempt;
      console.warn(`Navigation attempt ${attempt} failed, retrying in ${backoffDelay}ms...`);
      await page.waitForTimeout(backoffDelay);
    }
  }
}

/**
 * Wait for page to be ready after navigation
 * Checks multiple conditions to ensure page is fully loaded
 * @param page - Playwright page object
 * @param timeout - Maximum time to wait (default: 10000ms)
 */
export async function waitForPageReady(page: Page, timeout: number = 10000): Promise<void> {
  try {
    // Wait for DOM to be ready
    await page.waitForLoadState('domcontentloaded', { timeout });
    
    // Wait for any critical content to be present
    await page.waitForFunction(
      () => document.readyState === 'complete',
      { timeout }
    );
  } catch (error: any) {
    if (page.isClosed()) {
      throw new Error('Page was closed while waiting for page ready state');
    }
    throw error;
  }
}

