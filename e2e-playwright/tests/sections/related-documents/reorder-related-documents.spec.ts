import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { move } from '../../../pages/util';

test.describe(`reorder related documents`, async () => {
    test(`CDE`, async ({ page, relatedDocumentSection, navigationMenu }) => {
        const cdeName = 'Reorder reference document cde';
        await navigationMenu.login(Accounts.testEditor);
        await navigationMenu.gotoCdeByName(cdeName, true);

        const cdeRelatedDocumentsLocator = page
            .locator('id=reference-documents-div')
            .locator('table tbody tr')
            .getByTestId('title');
        const cdeRelatedDocuments = await cdeRelatedDocumentsLocator.allInnerTexts();

        await relatedDocumentSection.reorderRelatedDocument(0, 'down');
        move(cdeRelatedDocuments, 0, 1);
        await expect(cdeRelatedDocumentsLocator).toHaveText(cdeRelatedDocuments);

        await relatedDocumentSection.reorderRelatedDocument(1, 'up');
        move(cdeRelatedDocuments, 1, 0);
        await expect(cdeRelatedDocumentsLocator).toHaveText(cdeRelatedDocuments);

        await relatedDocumentSection.reorderRelatedDocument(2, 'top');
        move(cdeRelatedDocuments, 2, 0);
        await expect(cdeRelatedDocumentsLocator).toHaveText(cdeRelatedDocuments);
    });

    test(`Form`, async ({ page, relatedDocumentSection, navigationMenu }) => {
        const formName = 'Reorder reference document form';
        await navigationMenu.gotoFormByName(formName, true);
        await navigationMenu.login(Accounts.testEditor);

        const formRelatedDocumentsLocator = page
            .locator('id=reference-documents-div')
            .locator('table tbody tr')
            .getByTestId('title');
        const formRelatedDocuments = await formRelatedDocumentsLocator.allInnerTexts();

        await relatedDocumentSection.reorderRelatedDocument(0, 'down');
        move(formRelatedDocuments, 0, 1);
        await expect(formRelatedDocumentsLocator).toHaveText(formRelatedDocuments);

        await relatedDocumentSection.reorderRelatedDocument(2, 'up');
        move(formRelatedDocuments, 2, 1);
        await expect(formRelatedDocumentsLocator).toHaveText(formRelatedDocuments);

        await relatedDocumentSection.reorderRelatedDocument(2, 'top');
        move(formRelatedDocuments, 2, 0);
        await expect(formRelatedDocumentsLocator).toHaveText(formRelatedDocuments);
    });
});
