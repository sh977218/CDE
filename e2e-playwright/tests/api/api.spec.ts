import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`API testing`, async () => {
    test.describe(`Form API`, async () => {
        test(`form edit by tinyId version`, async ({ request }) => {
            const response = await request.get(`/server/form/forEdit/XJzVz1TZDe/version/v1.0 2014Jul2`);
            expect(response.ok()).toBeTruthy();
        });

        test(`draft save`, async ({ request, navigationMenu }) => {
            await navigationMenu.login(Accounts.nlm);
            const response = await request.get(`/server/form/draft/my9q6NmEb`);
            expect(response.status()).toBe(403);
        });

        test(`original source`, async ({ request }) => {
            const response = await request.get(`/server/form/originalSource/sourceName/tinyId`);
            expect(response.status()).toBe(404);
        });
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
    test.describe(`Pin API`, async () => {
        //Find a way to authenticate user before API testing
        test.skip();
        test(`User cannot query board not owned`, async ({ request, navigationMenu }) => {
            await navigationMenu.login(Accounts.regularUser);

            // this board is owned by boardUser
            const data = { boardId: '65c03c7f17988e10242138a9' };

            await test.step(`Cannot pin to board not owned`, async () => {
                const response = await request.post(`/server/board/pinToBoard`, { data });
                expect(response.status()).toBe(404);
            });
            await test.step(`Cannot delete pin from board not owned`, async () => {
                const response = await request.post(`/server/board/deletePin`, { data });
                expect(response.status()).toBe(404);
            });
            await test.step(`Cannot pin to board not owned`, async () => {
                const response = await request.post(`/server/board/pinEntireSearchToBoard`, { data });
                expect(response.status()).toBe(404);
            });
            await test.step(`Cannot move pin up to board not owned`, async () => {
                const response = await request.post(`/server/board/pinMoveUp`, { data });
                expect(response.status()).toBe(404);
            });
            await test.step(`Cannot move pin down to board not owned`, async () => {
                const response = await request.post(`/server/board/pinMoveDown`, { data });
                expect(response.status()).toBe(404);
            });
            await test.step(`Cannot move pin top to board not owned`, async () => {
                const response = await request.post(`/server/board/pinMoveTop`, { data });
                expect(response.status()).toBe(404);
            });
        });
        test(`Bad request`, async ({ request, navigationMenu }) => {
            await navigationMenu.login(Accounts.unpinUser);
            // this board is owned by unpinUser
            const data = { boardId: '57114b5328329938330f5c7f', tinyId: 'wrong' };

            await test.step(`deletePin`, async () => {
                const response = await request.post(`/server/board/deletePin`, { data });
                expect(response.status()).toBe(422);
            });
            await test.step(`pinMoveUp`, async () => {
                const response = await request.post(`/server/board/pinMoveUp`, { data });
                expect(response.status()).toBe(422);
            });
            await test.step(`pinMoveDown`, async () => {
                const response = await request.post(`/server/board/pinMoveDown`, { data });
                expect(response.status()).toBe(422);
            });
            await test.step(`pinMoveTop`, async () => {
                const response = await request.post(`/server/board/pinMoveTop`, { data });
                expect(response.status()).toBe(422);
            });
        });
    });

    test.describe('Board API', async () => {
        test(`page size too large`, async ({ request }) => {
            const response = await request.get(`/server/board/abc/0/1000`);
            expect(response.status()).toBe(400);
        });
    });

    test(`See CDE PVs with API key`, async ({ page }) => {
        const apiKey = 'f8e163df-6601-4444-b290-e904de1aedea';
        const cdeTinyId = 'mkmhYJOnk7l';
        await page.goto(`/api/de/${cdeTinyId}`);
        await expect(page.getByText(`Login to see the value.`)).toBeVisible();
        await page.goto(`/api/de/${cdeTinyId}?apiKey=${apiKey}`);
        await expect(page.getByText(`Login to see the value.`)).toBeHidden();
    });
});
