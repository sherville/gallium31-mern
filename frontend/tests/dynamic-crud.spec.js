/* eslint-disable testing-library/prefer-screen-queries */
const { test, expect } = require('@playwright/test');

const ADMIN_EMAIL = 'sherv@test.com';
const ADMIN_PASSWORD = '123456';

const STANDARD_EMAIL = 'standard@test.com';
const STANDARD_PASSWORD = '123456';

async function login(page, email = ADMIN_EMAIL, password = ADMIN_PASSWORD) {
  await page.goto('http://127.0.0.1:3000/login', { waitUntil: 'networkidle' });

  await page.locator('input[type="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('**/employees');
}

test.describe('Dynamic CRUD', () => {
  test('employees model CRUD flow', async ({ page }) => {
    const unique = Date.now().toString();
    const email = `playwright-${unique}@test.com`;

    await login(page);

    await page.goto('http://127.0.0.1:3000/dynamic');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('open-model-employees').click();
    await expect(page).toHaveURL(/dynamic\/employees/);

    await expect(page.getByTestId('field-firstName')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('field-firstName').fill('PW');
    await page.getByTestId('field-lastName').fill(`User${unique}`);
    await page.getByTestId('field-email').fill(email);
    await page.getByTestId('field-department').fill('QA');
    await page.getByTestId('field-salary').fill('25000');
    await page.getByTestId('field-hiredAt').fill('2026-04-13');
    await page.getByTestId('dynamic-submit').click();

    await expect(page.getByText(email)).toBeVisible();

    const row = page.locator('tr', { hasText: email });
    await row.getByRole('button', { name: 'Edit' }).click();

    await page.getByTestId('field-department').fill('Engineering');
    await page.getByTestId('field-salary').fill('30000');
    await page.getByTestId('dynamic-submit').click();

    await expect(page.getByText('Engineering')).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText(email)).not.toBeVisible();
  });

  test('products model CRUD flow', async ({ page }) => {
    const unique = Date.now().toString();
    const sku = `SKU-${unique}`;

    await login(page);

    await page.goto('http://127.0.0.1:3000/dynamic', { waitUntil: 'networkidle' });
    await page.getByTestId('open-model-products').click();
    await expect(page).toHaveURL(/dynamic\/products/);

    await page.getByTestId('field-name').fill(`Laptop ${unique}`);
    await page.getByTestId('field-sku').fill(sku);
    await page.getByTestId('field-price').fill('45000');
    await page.getByTestId('field-stock').fill('10');
    await page.getByTestId('dynamic-submit').click();

    await expect(page.getByText(sku)).toBeVisible();

    const row = page.locator('tr', { hasText: sku });
    await row.getByRole('button', { name: 'Edit' }).click();

    await page.getByTestId('field-price').fill('47000');
    await page.getByTestId('field-stock').fill('12');
    await page.getByTestId('dynamic-submit').click();

    await expect(page.getByText('47000')).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText(sku)).not.toBeVisible();
  });

 test('validation blocks invalid employee email', async ({ page }) => {
  const unique = Date.now().toString();

  await login(page);

  await page.goto('http://127.0.0.1:3000/dynamic/employees', { waitUntil: 'networkidle' });

  await page.getByTestId('field-firstName').fill('Invalid');
  await page.getByTestId('field-lastName').fill(`User${unique}`);
  await page.getByTestId('field-email').fill('bad-email');
  await page.getByTestId('dynamic-submit').click();

  const emailInput = page.getByTestId('field-email');
  const validity = await emailInput.evaluate((el) => el.checkValidity());

  expect(validity).toBeFalsy();
});
test('standard user cannot create employee record', async ({ page }) => {
  await login(page, STANDARD_EMAIL, STANDARD_PASSWORD);

  await page.goto('http://127.0.0.1:3000/dynamic/employees', {
    waitUntil: 'networkidle',
  });

  await page.getByTestId('field-firstName').fill('Standard');
  await page.getByTestId('field-lastName').fill('User');
  await page.getByTestId('field-email').fill('standard-user@test.com');
  await page.getByTestId('field-department').fill('Read Only');
  await page.getByTestId('field-salary').fill('10000');
  await page.getByTestId('field-hiredAt').fill('2026-04-27');

  await page.getByTestId('dynamic-submit').click();

  await expect(page.getByText(/access denied|insufficient permissions/i)).toBeVisible();
});

});