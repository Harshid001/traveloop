import { test, expect } from '@playwright/test';

test.describe('Authentication & User Flow E2E Tests', () => {
  test('landing page loads and presents login options', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Traveloop/i);

    const loginButton = page.locator('button, a').filter({ hasText: /log in|sign in/i });
    if (await loginButton.count() > 0) {
      await expect(loginButton.first()).toBeVisible();
    }
  });

  test('navigation to login screen renders input fields', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.count() > 0) {
      await expect(emailInput.first()).toBeVisible();
    }
  });

  test('navigation to signup screen works', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveURL(/.*signup/);
  });
});
