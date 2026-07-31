import { test, expect } from '@playwright/test';

test.describe('Traveloop Web App E2E Smoke Test', () => {
  test('home page loads successfully with key branding elements', async ({ page }) => {
    await page.goto('/');
    
    // Check that title contains Traveloop or main heading is rendered
    await expect(page).toHaveTitle(/Traveloop/i);
  });

  test('navigation to explore screen works', async ({ page }) => {
    await page.goto('/explore');
    await expect(page).toHaveURL(/.*explore/);
  });
});
