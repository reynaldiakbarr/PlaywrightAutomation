// Install Playwright first: npm init playwright@latest

import { test, expect } from '@playwright/test';

test.describe('SauceDemo E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to SauceDemo
    await page.goto('https://www.saucedemo.com/');
  });

  test('Complete purchase flow - Add to cart, checkout, and complete order', async ({ page }) => {
    // Login
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Verify we're on the products page
    await expect(page.locator('.title')).toHaveText('Products');
    await expect(page).toHaveURL(/.*inventory.html/);

    // Add first product to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    
    // Verify cart badge shows 1 item
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Add second product to cart
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    
    // Verify cart badge shows 2 items
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // Go to cart
    await page.click('.shopping_cart_link');
    
    // Verify we're on cart page
    await expect(page.locator('.title')).toHaveText('Your Cart');
    
    // Verify 2 items are in cart
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(2);

    // Verify product names
    await expect(page.locator('.inventory_item_name').first()).toHaveText('Sauce Labs Backpack');
    await expect(page.locator('.inventory_item_name').nth(1)).toHaveText('Sauce Labs Bike Light');

    // Proceed to checkout
    await page.click('[data-test="checkout"]');

    // Verify we're on checkout page
    await expect(page.locator('.title')).toHaveText('Checkout: Your Information');

    // Fill checkout information
    await page.fill('[data-test="firstName"]', 'John');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '12345');

    // Continue to overview
    await page.click('[data-test="continue"]');

    // Verify we're on checkout overview page
    await expect(page.locator('.title')).toHaveText('Checkout: Overview');

    // Verify items in overview
    await expect(page.locator('.cart_item')).toHaveCount(2);

    // Verify payment and shipping information is present
    await expect(page.locator('[data-test="payment-info-label"]')).toBeVisible();
    await expect(page.locator('[data-test="shipping-info-label"]')).toBeVisible();
    
    // Get and verify total price
    const totalPrice = await page.locator('.summary_total_label').textContent();
    expect(totalPrice).toContain('Total: $');

    // Complete the order
    await page.click('[data-test="finish"]');

    // Verify order completion
    await expect(page.locator('.title')).toHaveText('Checkout: Complete!');
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
    await expect(page.locator('.complete-text')).toContainText('Your order has been dispatched');

    // Verify success image is displayed
    await expect(page.locator('.pony_express')).toBeVisible();

    // Click back home button
    await page.click('[data-test="back-to-products"]');

    // Verify we're back on products page
    await expect(page.locator('.title')).toHaveText('Products');
    
    // Verify cart is empty
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  test('Login with invalid credentials should show error', async ({ page }) => {
    // Try to login with invalid credentials
    await page.fill('#user-name', 'invalid_user');
    await page.fill('#password', 'wrong_password');
    await page.click('#login-button');

    // Verify error message is displayed
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
  });

  test('Remove item from cart', async ({ page }) => {
    // Login
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Add product to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Remove product from cart
    await page.click('[data-test="remove-sauce-labs-backpack"]');

    // Verify cart badge is not visible (empty cart)
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  test('Sort products by price low to high', async ({ page }) => {
    // Login
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Sort by price low to high
    await page.selectOption('[data-test="product-sort-container"]', 'lohi');

    // Get all prices
    const prices = await page.locator('.inventory_item_price').allTextContents();
    const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));

    // Verify prices are in ascending order
    for (let i = 0; i < numericPrices.length - 1; i++) {
      expect(numericPrices[i]).toBeLessThanOrEqual(numericPrices[i + 1]);
    }
  });

  test('Logout successfully', async ({ page }) => {
    // Login
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Open menu
    await page.click('#react-burger-menu-btn');
    
    // Wait for menu to be visible
    await page.waitForSelector('.bm-menu', { state: 'visible' });

    // Click logout
    await page.click('#logout_sidebar_link');

    // Verify we're back on login page
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('#login-button')).toBeVisible();
  });
});