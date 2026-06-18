const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');

const PAGES = [
  { path: '/', name: 'Dashboard', selector: '.stats-grid' },
  { path: '/admin', name: 'Admin', selector: '.toolbar' },
  // { path: '/admin/users', name: 'Admin Users', selector: '.data-table-wrapper' },
  // { path: '/admin/job-titles', name: 'Admin Job Titles', selector: '.data-table-wrapper' },
  // { path: '/admin/pay-grades', name: 'Admin Pay Grades', selector: '.card' },
  // { path: '/admin/work-shifts', name: 'Admin Work Shifts', selector: '.card' },
  // { path: '/admin/organization', name: 'Admin Organization', selector: '.card' },
  // { path: '/admin/roles', name: 'Admin Roles', selector: '.card' },
  { path: '/pim/list', name: 'PIM Employee List', selector: '.card' },
  { path: '/leave/requests', name: 'Leave Requests', selector: '.card' },
  // { path: '/leave/types', name: 'Leave Types', selector: '.card' },
  // { path: '/leave/entitlements', name: 'Leave Entitlements', selector: '.card' },
  // { path: '/leave/holidays', name: 'Leave Holidays', selector: '.card' },
  { path: '/time/timesheets', name: 'Time Timesheets', selector: '.card' },
  // { path: '/time/attendance', name: 'Time Attendance', selector: '.card' },
  { path: '/recruitment/vacancies', name: 'Recruitment Vacancies', selector: '.card' },
  // { path: '/recruitment/candidates', name: 'Recruitment Candidates', selector: '.card' },
  { path: '/training', name: 'Training Courses', selector: '.tab-content' },
  { path: '/performance/reviews', name: 'Performance Reviews', selector: '.card' },
  { path: '/directory', name: 'Directory', selector: '.employee-grid' },
  { path: '/buzz', name: 'Buzz', selector: '.card' },
];

//example of using group
test.describe('Module Pages After Login', () => {

//example of using hooks
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('admin', 'admin123');
    await expect(page).toHaveURL('/', { timeout: 15000 });
    await expect(page.locator('.stats-grid')).toBeVisible({ timeout: 15000 });
  });

  for (const { path, name, selector } of PAGES) {
    test(`${name} loads correctly`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(path, { timeout: 10000 });
      await page.locator(selector).waitFor({ state: 'visible', timeout: 15000 });
      const hasError = await page.locator('.error-msg, .error-boundary').count();
      expect(hasError).toBe(0);
    });
  }

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/logout');
    await page.close();
  });
});
