import test from '../../fixtures/base-fixtures';
import user from '../../data/user';

test.describe(`Auto complete`, async () => {
    test.describe(`Cde search`, async () => {
        const searchTerm = 'specimen lat*';
        test.beforeEach(async ({cdePage}) => {
            await cdePage.goToSearch('cde');
        })

        test(`Not Logged in user can only see 'Standard' and 'Qualified'`, async ({page, cdePage, searchPage}) => {
            const cdeName = 'Cell Specimen Requirement Pathology Finding Status Specimen Histopathological Text Type';
            await searchPage.searchQueryInput().fill(searchTerm);
            for (let i = 1; i <= await searchPage.searchAutoCompleteOptions().count(); i++) {
                await test.expect(searchPage.searchAutoCompleteOptions().nth(i)).not.toContainText('Specimen Laterality');
            }
            const navigationPromise = page.waitForNavigation();
            await searchPage.searchAutoCompleteOptions()
                .filter({hasText: cdeName})
                .click();
            await navigationPromise;
            await test.expect(cdePage.cdeTitle()).toContainText(cdeName);
        })

        test(`Logged in user can see all status`, async ({page, cdePage, navigationMenu, searchPage}) => {
            const cdeName = 'Specimen Laterality Not Specified Reason';
            await navigationMenu.login(user.nlm.username, user.nlm.password);
            await searchPage.searchQueryInput().fill(searchTerm);
            const navigationPromise = page.waitForNavigation();
            await searchPage.searchAutoCompleteOptions()
                .filter({hasText: cdeName})
                .click();
            await navigationPromise;
            await test.expect(cdePage.cdeTitle()).toContainText(cdeName);
        })
    });

    test.describe(`Form search`, async () => {
        const searchTerm = 'multi';
        test.beforeEach(async ({formPage}) => {
            await formPage.goToSearch('form');
        })

        test(`Not Logged in user can only see 'Standard' and 'Qualified'`, async ({page, formPage, searchPage}) => {
            const formName = 'Multiple Sclerosis Quality of Life (MSQOL)-54';
            await searchPage.searchQueryInput().fill(searchTerm);
            for (let i = 1; i <= await searchPage.searchAutoCompleteOptions().count(); i++) {
                await test.expect(searchPage.searchAutoCompleteOptions().nth(i)).not.toContainText('MultiSelect');
            }
            const navigationPromise = page.waitForNavigation();
            await searchPage.searchAutoCompleteOptions()
                .filter({hasText: formName})
                .click();
            await navigationPromise
            await test.expect(formPage.formTitle()).toContainText(formName);
        })

        test(`Logged in user can see all status`, async ({page, formPage, navigationMenu, searchPage}) => {
            const formName = 'MultiSelect Logic';
            await navigationMenu.login(user.nlm.username, user.nlm.password);
            await searchPage.searchQueryInput().fill(searchTerm);
            const navigationPromise = page.waitForNavigation();
            await searchPage.searchAutoCompleteOptions()
                .filter({hasText: formName})
                .click();
            await navigationPromise;
            await test.expect(formPage.formTitle()).toContainText(formName);
        })
    });
});
