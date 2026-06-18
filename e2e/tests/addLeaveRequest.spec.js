const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../pages/LoginPage');

test.describe('Leave Request', () => {

    test.beforeEach(async ({ page }) => {
        const login = new LoginPage(page);
        await login.goto();
        await login.login('admin', 'admin123');
        await expect(page).toHaveURL('/', { timeout: 15000 });
        await expect(page.locator('.stats-grid')).toBeVisible({ timeout: 15000 });
    });

    test('add leave request', async ({ page }) => {
        await page.goto('leave/requests', { waitUntil: 'domcontentloaded' });

        await page.getByRole('button', { name: 'Apply Leave' }).click()
        //Define the modal container locator for isolation
        const modal = page.locator('#leaveRequest');

        //Wait until the modal becomes visible on screen
        await expect(modal).toBeVisible();

        // Handling dropdown selection
        await modal.locator('#leaveEmployee').selectOption('Admin User');
        await modal.locator('#leaveType').selectOption('Sick Leave');

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];

        await modal.locator('input[name="fromDate"]').fill(formattedDate);
        await modal.locator('input[name="toDate"]').fill(formattedDate);

        await modal.locator('#leaveReason').fill('Sick Leave')

        // Submit the form inside the modal
        await modal.getByRole('button', { name: 'Apply' }).click();

        // Verify the modal has successfully closed
        await expect(modal).toBeHidden();
    })


    test('delete leave request', async({page}) =>{
        await page.goto('leave/requests', { waitUntil: 'domcontentloaded' });
        //click first reject button from the list
        await page.getByRole('button', { name: 'Reject' }).first().click()

        await page.getByRole('button', { name: 'Confirm' }).click();
    })


    test('approve leave request', async({page}) =>{ 
        await page.goto('leave/requests', { waitUntil: 'domcontentloaded' });

        //click first approve button from the list
        await page.getByRole('button', { name: 'Approve' }).first().click();
        await page.getByRole('button', { name: 'Confirm' }).click();
    })

})
