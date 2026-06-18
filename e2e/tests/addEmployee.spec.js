const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../pages/LoginPage');
const { PimPage } = require('../pages/PimPage');

test.describe('Employee Module', () => {

    test.beforeEach(async ({ page }) => {
        const login = new LoginPage(page);
        await login.goto();
        await login.login('admin', 'admin123');
        await expect(page).toHaveURL('/', { timeout: 15000 });
        await expect(page.locator('.stats-grid')).toBeVisible({ timeout: 15000 });
    });

    test('add employee', async ({ page }) => {
        const pim = new PimPage(page);
        await pim.gotoAddEmployee();
        await pim.fillEmployeeDetails('Ashutosh', 'D', 'Srivastava', 'IT', 'ashutosh@gmail.com', 'Senior Developer', 'Admin User');
        await pim.save();
        await page.goto('/pim/list', { waitUntil: 'domcontentloaded' });
        // await expect(pim.employeeListHeader).toBeVisible({ timeout: 10000 });
    })

    test('delete employee', async ({ page }) => {
        await page.goto('/pim/list', { waitUntil: 'domcontentloaded' });
        await page.getByTitle('Delete').first().click()

        page.on('dialog', async dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            await dialog.accept();
        });

        await page.getByRole('button', { name: 'Confirm' }).click();
    })
})
