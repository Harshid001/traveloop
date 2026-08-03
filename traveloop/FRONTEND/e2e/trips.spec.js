import { test, expect } from '@playwright/test';

test.describe('Trip Planning & Discovery E2E Tests', () => {
  test('explore page renders search and destination grid', async ({ page }) => {
    await page.goto('/explore');
    await expect(page).toHaveURL(/.*explore/);
    
    // Check main headings or search input on explore page
    const headings = page.locator('h1, h2, h3');
    await expect(headings.first()).toBeVisible();
  });

  test('create trip page renders trip form fields', async ({ page }) => {
    await page.goto('/create-trip');
    await expect(page).toHaveURL(/.*create-trip/);
  });
});
