const {test, expect} = require('@playwright/test')
const { LoginPage} = require('../pages/LoginPage')
const {BuzzPage} = require('../pages/BuzzPage')

test.describe('Buzz', () => {

    test.beforeEach(async ({ page }) => {
        const login = new LoginPage(page);
        await login.goto();
        await login.login('admin', 'admin123');
        await expect(page).toHaveURL('/', { timeout: 15000 });
        await expect(page.locator('.stats-grid')).toBeVisible({ timeout: 15000 });
    });

    test('add buzz', async({ page }) => {
        const buzzPage = new BuzzPage(page)
        await page.goto('/buzz', { waitUntil: 'domcontentloaded' });
        await buzzPage.addBuzz('Admin User', 'New post');
        await buzzPage.saveBuzz();
    });


    test('delete buzz', async({page}) => {
        await page.goto('/buzz', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: 'Delete' }).nth(0).click()
    })
})




