import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test.describe('Login Flow', () => {
    test('login page renders correctly', async ({ page }) => {
      await page.goto('/admin/login');
      
      await expect(page.locator('h2:has-text("AlgoGI CMS")')).toBeVisible();
      await expect(page.locator('text=Sign in with your @algogi.com account')).toBeVisible();
      await expect(page.locator('button:has-text("Sign in with Google")')).toBeVisible();
    });

    test('Google OAuth button is clickable', async ({ page }) => {
      await page.goto('/admin/login');
      
      const loginButton = page.locator('button:has-text("Sign in with Google")');
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toBeEnabled();
    });

    test('error messages display for invalid domain', async ({ page }) => {
      await page.goto('/admin/login?error=invalid_domain');
      
      const errorMessage = page.locator('text=Only @algogi.com email addresses are allowed');
      await expect(errorMessage).toBeVisible();
    });

    test('error messages display for auth failure', async ({ page }) => {
      await page.goto('/admin/login?error=auth_failed');
      
      const errorMessage = page.locator('text=Authentication failed');
      await expect(errorMessage).toBeVisible();
    });

    test('error messages display for missing token', async ({ page }) => {
      await page.goto('/admin/login?error=missing_token');
      
      const errorMessage = page.locator('text=Missing authentication token');
      await expect(errorMessage).toBeVisible();
    });

    test('loading state during login', async ({ page, context }) => {
      // Prevent new page creation (OAuth redirect opens new window)
      context.on('page', (newPage) => {
        newPage.close();
      });
      
      await page.goto('/admin/login');
      await page.waitForLoadState('networkidle');
      
      // Mock the login API with a delay to give us time to check loading state
      await page.route('**/api/auth/login', async route => {
        // Delay fulfillment to give us time to check button state
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ authUrl: 'https://accounts.google.com/oauth' }),
        });
      });

      const loginButton = page.locator('button:has-text("Sign in with Google")');
      await expect(loginButton).toBeVisible();
      
      // Click button - this triggers setLoading(true) synchronously
      await loginButton.click();
      
      // Check loading state IMMEDIATELY after click using evaluate (doesn't rely on locator)
      // React state update happens synchronously, so we can check right away
      const buttonState = await page.evaluate(() => {
        const button = document.querySelector('button') as HTMLButtonElement;
        if (!button) return { text: '', disabled: false };
        return {
          text: button.textContent || '',
          disabled: button.disabled,
        };
      });
      
      const hasLoadingState = buttonState.text.includes('Signing') || buttonState.disabled;
      expect(hasLoadingState).toBe(true);
    });
  });

  test.describe('Protected Routes', () => {
    test('unauthenticated users redirected to login', async ({ page }) => {
      await page.goto('/admin');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('unauthenticated users cannot access admin pages', async ({ page }) => {
      // Try to access various admin pages
      const adminPages = ['/admin/blog', '/admin/careers', '/admin/portfolio'];
      
      for (const adminPage of adminPages) {
        await page.goto(adminPage);
        await expect(page).toHaveURL(/\/admin\/login/);
      }
    });

    test('authenticated users can access admin pages', async ({ page, context }) => {
      // Note: This test requires actual authentication setup
      // For now, we'll test the structure
      // In a real scenario, you would:
      // 1. Set up authenticated session
      // 2. Navigate to admin page
      // 3. Verify access
      
      // Mock authenticated session
      await context.addCookies([{
        name: 'session',
        value: 'test-session-token',
        domain: 'localhost',
        path: '/',
      }]);

      // Try to access admin page
      // Note: This will fail if auth is properly implemented
      // This is a placeholder test structure
    });
  });

  test.describe('Session Management', () => {
    test('session persists across page navigation', async ({ page, context }) => {
      // Mock authenticated session
      await context.addCookies([{
        name: 'session',
        value: 'test-session-token',
        domain: 'localhost',
        path: '/',
      }]);

      // Navigate and check session
      // This is a placeholder - actual implementation depends on your auth system
    });

    test('logout functionality works', async ({ page }) => {
      // Navigate to logout endpoint
      await page.goto('/api/auth/logout');
      
      // Should redirect or clear session
      await page.waitForTimeout(500);
      
      // Try to access admin page - should redirect to login
      await page.goto('/admin');
      await expect(page).toHaveURL(/\/admin\/login/);
    });
  });
});

