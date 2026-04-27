import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should log in successfully and redirect to dashboard', async ({ page }) => {
    let fakeEmail = 'testing@gmail.com';
    let fakePassword = 'password123';

    // 2. Go to the login page
    await page.goto('/auth/login');

    // 3. Verify page elements
    await expect(page.getByText('Login', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Enter your email below to login to your account')).toBeVisible();

    // 4. Fill in the form
    await page.getByLabel('Email').fill(fakeEmail);
    await page.getByLabel('Password').fill(fakePassword);

    // 5. Submit the form
    await page.getByRole('button', { name: 'Login' }).click();

    // 6. Verify redirection to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should show an error message on invalid credentials', async ({ page }) => {
    // 1. Mock the Supabase auth request to return an error
    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Invalid login credentials',
        }),
      });
    });

    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    // 2. Verify error message is shown (assuming your LoginForm displays it)
    await expect(page.getByText('Invalid login credentials')).toBeVisible();
  });
});
