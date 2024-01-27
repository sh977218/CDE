import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test.describe.configure({ retries: 0 }); // no retries for edits
test(`Remove organization classification`, async ({
    page,
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
    await navigationMenu.gotoCdeSearch();
    await navigationMenu.login(Accounts.ninds);
    await searchPage.searchQueryInput().fill(searchString);
    await searchPage.searchSubmitButton().click();
    await expect(page.getByText('102 results. Sorted by relevance.')).toBeVisible();

    await navigationMenu.gotoFormSearch();
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

    await navigationMenu.gotoCdeSearch();
    await searchPage.searchQueryInput().fill(searchString);
    await searchPage.searchSubmitButton().click();
    await expect(page.getByText('102 results. Sorted by relevance.')).toBeHidden();

    await navigationMenu.gotoFormSearch();
    await searchPage.searchQueryInput().fill(searchString);
    await searchPage.searchSubmitButton().click();
    await expect(page.getByText('34 results. Sorted by relevance.')).toBeHidden();

    await navigationMenu.logout();
    await navigationMenu.login(Accounts.nlm);
    await navigationMenu.gotoAudit();
    await auditTab.classificationAuditLog().click();
    const locator = classificationAuditPage.classificationAuditByTitle(`10+ cdes ${classificationArray.join(' > ')}`);
    await classificationAuditPage.openClassificationAudit(locator);
    await expect(classificationAuditPage.classificationAuditDescriptionByTitle(locator)).toHaveText(
        `delete ${classificationArray.join(' > ')}`
    );
    await classificationAuditPage.closeClassificationAuditByTitle(locator);
});
