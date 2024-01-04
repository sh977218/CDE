import { expect } from '@playwright/test';
import test from '../../fixtures/base-fixtures';
import user from '../../data/user';

test.describe(`Classification`, async () => {
    test(`Remove organization classification`, async ({
        page,
        basePage,
        searchPage,
        navigationMenu,
        manageClassificationPage,
        materialPage,
        auditTab,
        classificationAuditPage,
    }) => {
        const classificationToBeRemoved = `Participant/Subject Characteristics`;
        const searchString = `classification.elements.elements.name: "${classificationToBeRemoved}"`;
        const classificationArray = ['NINDS', 'Domain', classificationToBeRemoved];
        await basePage.goToSearch('cde');
        await navigationMenu.login(user.ninds.username, user.ninds.password);
        await searchPage.searchQueryInput().fill(searchString);
        await searchPage.searchSubmitButton().click();
        await expect(page.getByText('102 results. Sorted by relevance.')).toBeVisible();

        await basePage.goToSearch('form');
        await searchPage.searchQueryInput().fill(searchString);
        await searchPage.searchSubmitButton().click();
        await expect(page.getByText('34 results. Sorted by relevance.')).toBeVisible();

        await navigationMenu.gotoClassification();
        await manageClassificationPage.selectOrganization('NINDS');
        const leafNode = await manageClassificationPage.expandClassificationAndReturnLeafNode(classificationArray);
        await manageClassificationPage.classificationMenu(leafNode).click();
        await manageClassificationPage.classificationOption('Remove').click();
        await manageClassificationPage.confirmRemoveClassificationInput().fill('Participant/Subject Characteristics');
        await manageClassificationPage.confirmRemoveClassificationButton().click();
        await materialPage.checkAlert(`Deleting in progress.`);

        await basePage.goToSearch('cde');
        await searchPage.searchQueryInput().fill(searchString);
        await searchPage.searchSubmitButton().click();
        await expect(page.getByText('102 results. Sorted by relevance.')).toBeHidden();

        await basePage.goToSearch('form');
        await searchPage.searchQueryInput().fill(searchString);
        await searchPage.searchSubmitButton().click();
        await expect(page.getByText('34 results. Sorted by relevance.')).toBeHidden();

        await navigationMenu.logout();
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await navigationMenu.gotoAudit();
        await auditTab.classificationAudit().click();
        const locator = classificationAuditPage.classificationAuditByTitle(
            `10+ cdes ${classificationArray.join(' > ')}`
        );
        await classificationAuditPage.openClassificationAudit(locator);
        await expect(classificationAuditPage.classificationAuditDescriptionByTitle(locator)).toHaveText(
            `delete ${classificationArray.join(' > ')}`
        );
        await classificationAuditPage.closeClassificationAuditByTitle(locator);
    });
});
