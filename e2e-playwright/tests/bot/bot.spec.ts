import { expect } from '@playwright/test';

import { test } from '../../fixtures/base-fixtures';

test.use({ userAgent: 'bot' });
test.describe(`bot test`, async () => {
    test(`Home page`, async ({ page }) => {
        await page.goto('http://localhost:3001/home');
        await expect(page.getByText('Browse CDEs')).not.toHaveCount(0);
        await expect(page.getByText('Browse Forms')).not.toHaveCount(0);
    });

    test(`CDE search page`, async ({ page }) => {
        await page.goto('http://localhost:3001/cde/search');
        await expect(page.getByText('Global Rare Diseases Patient Registry Data Repository')).not.toHaveCount(0);

        await page.goto('http://localhost:3001/cde/search?selectedOrg=NICHD');
        await expect(
            page.getByText('Behavioral Assessment Bayley Scales of Infant Development java.lang.String')
        ).not.toHaveCount(0);
    });

    test(`Form search page`, async ({ page }) => {
        await page.goto('http://localhost:3001/form/search');
        await expect(page.getByText('Patient Reported Outcomes Measurement Information System')).not.toHaveCount(0);

        await page.goto('http://localhost:3001/form/search?selectedOrg=NIDA');
        await expect(page.getByText('Patient Health Questionnaire-2 (PHQ-2) More Questions')).not.toHaveCount(0);
    });

    test(`CDE view page`, async ({ page }) => {
        await page.goto('http://localhost:3001/deView?tinyId=QJxhjQVkke');
        await expect(
            page.getByText(
                'Patient Health Questionnaire (PHQ-9) Last Two Weeks How Often Little Interest or Pleasure in Doing Things Score 4 Point Scale'
            )
        ).not.toHaveCount(0);
        await expect(page.getByText('Value List')).not.toHaveCount(0);
        await expect(page.getByText('A subjective answer of non-agreement.')).not.toHaveCount(0);
        await expect(page.getByText('PHQ9_LTL_INTEREST_SC')).not.toHaveCount(0);
        await expect(page.getByText('3811418')).not.toHaveCount(0);
    });

    test(`Form view page`, async ({ page }) => {
        await page.goto('http://localhost:3001/formView?tinyId=mJsGoMU1m');
        await expect(page.getByText('PHQ-9 quick depression assessment panel [Reported.PHQ]')).not.toHaveCount(0);
        await expect(page.getByText('Description: Kroenke K, Spitzer RL, Williams JB.')).not.toHaveCount(0);
        await expect(page.getByText('PHQ-9 quick depression assessment Pnl')).not.toHaveCount(0);
        await expect(page.getByText('44249-1')).not.toHaveCount(0);
    });

    test(`site map`, async ({ request }) => {
        const siteMap = await request.get('http://localhost:3001/sitemap.txt');
        expect(await siteMap.text()).toContain('/deView?tinyId=rkh4tQrOgTw');
    });
});
