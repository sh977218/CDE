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
    test.describe(`uom convert`, async () => {
        test(`Invalidate uom query parameter return empty array`, async ({ request }) => {
            const response = await request.get(`/server/ucumSynonyms?uom=kgg`);
            const body = await response.json();
            expect(response.ok()).toBeTruthy();
            expect(body).toStrictEqual([]);
        });

        test(`Invalidate uom payload psi return suggest`, async ({ request }) => {
            const response = await request.post(`/server/ucumValidate`, {
                data: { uoms: ['psi'] },
            });
            const body = await response.json();
            expect(response.ok()).toBeTruthy();
            expect(body).toStrictEqual({
                errors: [`Unit is not found. Did you mean pound per square inch?`],
                units: ['psi'],
            });
        });

        test(`Invalidate uom payload meters return suggest`, async ({ request }) => {
            const response = await request.post(`/server/ucumValidate`, {
                data: { uoms: ['meters'] },
            });
            const body = await response.json();
            expect(response.ok()).toBeTruthy();
            expect(body).toStrictEqual({
                errors: [`Unit is not found. Did you mean m (meter)?`],
                units: ['meters'],
            });
        });

        test(`Invalidate uom payload mets return error`, async ({ request }) => {
            const response = await request.post(`/server/ucumValidate`, {
                data: { uoms: ['mets'] },
            });
            const body = await response.json();
            expect(response.ok()).toBeTruthy();
            expect(body).toStrictEqual({
                errors: [`mets is not a valid UCUM code.  No alternatives were found.`],
                units: ['mets'],
            });
        });
        test(`Invalidate uom payload meters return error`, async ({ request }) => {
            const response = await request.get(`/server/ucumConvert?value=0&to=0&from=0`);
            const body = await response.json();
            expect(response.ok()).toBeTruthy();
            expect(body).toBe(0);
        });
    });
});
