import { test, expect, devices } from '@playwright/test';

test('Mobile Iphone Purchase with Video Recording and Screenshots', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  // 1. Capture Login Page Screenshot
  await page.screenshot({ path: 'screenshots/login-page.png' });

  await page.fill('[data-test="username"]', 'standard_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');

  // 2. Add item and go to checkout
  await page.locator('.inventory_item').first().locator('button').click();
  await page.click('.shopping_cart_link');
  await page.click('[data-test="checkout"]');

  // 3. Take a Full Page Screenshot of the Checkout Form
  // This captures the entire scrollable area, not just the viewport
  await page.screenshot({ path: 'screenshots/checkout-form-full.png', fullPage: true });

  await page.fill('[data-test="firstName"]', 'QA');
  await page.fill('[data-test="lastName"]', 'Automation');
  await page.fill('[data-test="postalCode"]', '12345');
  await page.click('[data-test="continue"]');
  await page.click('[data-test="finish"]');

  // 4. Capture only the Success Header element
  const successHeader = page.locator('.complete-header');
  await successHeader.screenshot({ path: 'screenshots/success-msg.png' });

  await expect(successHeader).toHaveText('Thank you for your order!');
});