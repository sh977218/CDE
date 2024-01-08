import { expect } from '@playwright/test';
import test from '../../fixtures/base-fixtures';

test.describe(`App Routing`, async () => {
    test.describe(`Logged In required routes`, async () => {
        const loggedInRequiredRoutes = [
            `classificationManagement`,
            `formEdit`,
            `settings`,
            `searchPreferences`,
            `siteAudit`,
        ];
        for (const loggedInRequiredRoute of loggedInRequiredRoutes) {
            test(`${loggedInRequiredRoute}`, async ({ page }) => {
                await page.goto(`/${loggedInRequiredRoute}`);
                await expect(page).toHaveURL('/login');
            });
        }
    });
});
