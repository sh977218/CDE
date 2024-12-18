import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';

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
                await expect(page).toHaveTitle(`Login`);
            });
        }
    });

    test.describe(`Logged In not required routes`, async () => {
        const loggedInNotRequiredRoutes = [
            { url: `home`, title: 'NIH Common Data Elements (CDE) Repository' },
            { url: `cde/search`, title: 'Data Element Search' },
            { url: `form/search`, title: 'Form Search' },
            { url: `myBoards`, title: 'My Boards' },
            { url: `about`, title: 'About' },
            { url: `guides`, title: 'Guides' },
            { url: `whatsNew`, title: `What's New` },
            { url: `resources`, title: 'Resources' },
            { url: `deView?tinyId=JYVMoe0kPPm`, title: 'Data Element: Address Change Date java.util.Date' },
            {
                url: `formView?tinyId=XkZqYRlqKf`,
                title: 'Form: Patient Health Questionnaire 2 item (PHQ-2) [Reported]',
            },
        ];
        for (const loggedInNotRequiredRoute of loggedInNotRequiredRoutes) {
            test(`${loggedInNotRequiredRoute.url}`, async ({ page }) => {
                await page.goto(`/${loggedInNotRequiredRoute.url}`);
                await expect(page).toHaveTitle(`${loggedInNotRequiredRoute.title}`);
            });
        }
    });

    test.describe(`404 page @oneTest`, async () => {
        test(`wrong route`, async ({ page }) => {
            await page.goto(`/abc`);
            await expect(page).toHaveTitle('Page Not Found');
        });
        test(`wrong tinyId`, async ({ page }) => {
            await page.goto(`/deView?tinyId=abc`);
            await expect(page).toHaveTitle('Page Not Found');
        });
    });
});
