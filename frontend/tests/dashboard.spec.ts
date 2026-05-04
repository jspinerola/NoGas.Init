import { test, expect } from './auth.setup';

const VEHICLES_KEY = 'garage_vehicles';

const mockVehicle = {
  id: 1,
  name: 'Betsy',
  year: 2020,
  make: 'Toyota',
  model: 'Corolla',
  licensePlate: 'ABC-1234',
  miles: 15000,
  vinPrefix: '1NXBR32E',
  mpg: 32,
  nextService: new Date().toISOString(),
  isDefault: true,
};

test.describe('Dashboard and Car Management', () => {
  test('should show empty state when no vehicles exist', async ({ authenticatedPage: page }) => {
    // We are already on /dashboard thanks to the fixture
    await page.evaluate((key) => localStorage.removeItem(key), VEHICLES_KEY);
    await page.reload();
    await expect(page.getByText('No default vehicle selected.')).toBeVisible();
  });

  test('should display vehicle card when data exists in localStorage', async ({ authenticatedPage: page }) => {
    // We are already on /dashboard thanks to the fixture
    await page.evaluate(({ key, data }) => {
      localStorage.setItem(key, JSON.stringify([data]));
    }, { key: VEHICLES_KEY, data: mockVehicle });
    await page.reload();
    await expect(page.getByText('Vehicle: Betsy')).toBeVisible();
  });
});
