const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { LogoutPage } = require('../pages/LogoutPage')

test.describe('Login Functionality', () => {

  test('displays login page with all elements', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await expect(page.locator('.login-card')).toBeVisible();
    await expect(login.usernameInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.loginButton).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('.login-credentials')).toHaveText(/admin/);
    await expect(page.locator('.login-credentials')).toHaveText(/admin123/);
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginButton.click();
    await expect(page.locator('.field-error')).toHaveCount(2);
  });

  test('shows error for invalid credentials', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('wrong', 'wrong');
    await expect(login.errorMsg).toBeVisible({ timeout: 10000 });
  });


  test('logout redirects to login', async ({ page }) => {
    const login = new LoginPage(page);
    const logoutPage = new LogoutPage(page);
    await login.goto();
    await login.login('admin', 'admin123');
    await logoutPage.logout();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

});
