import { test as base, expect } from '@playwright/test';

// Extend the base test to include an 'authenticatedPage' fixture
export const test = base.extend<{ authenticatedPage: import('@playwright/test').Page }>({
  authenticatedPage: async ({ page }, use) => {
    let fakeEmail = 'testing@gmail.com';
    let fakePassword = 'password123';

    // Perform manual login
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill(fakeEmail);
    await page.getByLabel('Password').fill(fakePassword);
    await page.getByRole('button', { name: 'Login' }).click();

    // Ensure we reached the dashboard before handing over the page
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Use the page in the test
    await use(page);
  },
});

export { expect };
