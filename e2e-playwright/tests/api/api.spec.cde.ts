import { expect } from '@playwright/test';
import test from '../../fixtures/base-fixtures';
import user from '../../data/user';

test.describe(`API testing`, async () => {
    test.beforeEach(async ({ homePage }) => {
        await homePage.goToHome();
    });

    test(`form edit by tinyId version`, async ({ request }) => {
        const form = await request.get(`/server/form/forEdit/XJzVz1TZDe/version/v1.0 2014Jul2`);
        expect(form.ok()).toBeTruthy();
    });

    test(`draft save`, async ({ request, page, navigationMenu }) => {
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        const form = await request.get(`/server/form/draft/my9q6NmEb`);
        expect(form.status()).toBe(403);
    });

    test(`original source`, async ({ request }) => {
        const form = await request.get(`/server/form/originalSource/sourceName/tinyId`);
        expect(form.status()).toBe(404);
    });
});
