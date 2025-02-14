import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`Search`, async () => {
    test(`english analyzer is not searchable`, async ({ page, navigationMenu, searchPage }) => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.searchQueryInput().fill(`"Physical exam perform"`);
        await searchPage.searchSubmitButton().click();
        await expect(page.getByText('Physical exam performed indicator')).not.toHaveCount(0);
        await expect(page.locator('id=usedBy_0')).toHaveText('NINDS');

        await searchPage.searchQueryInput().fill(`"of"`);
        await searchPage.searchSubmitButton().click();
        await expect(page.getByText('No results were found.')).not.toHaveCount(0);
    });

    test(`highlight search term`, async ({ page, navigationMenu, searchPage }) => {
        await navigationMenu.gotoCdeSearch();

        await test.step(`no fragment`, async () => {
            await searchPage.searchQueryInput().fill(`"using OMB Approved"`);
            await searchPage.searchSubmitButton().click();
            await expect(
                page.getByText(
                    "the patient's self declared racial origination, independent of ethnic origination, using OMB approved categories"
                )
            ).not.toHaveCount(0);
            await expect(page.locator("//*[@id='searchResult_0']//strong[.='OMB']")).toBeVisible();
        });

        await test.step(`with fragment`, async () => {
            await searchPage.searchQueryInput().fill(`"enzymatic processing of a polypeptide"`);
            await searchPage.searchSubmitButton().click();
            await expect(page.getByText('A compound of two or more amino acids where the al [...]')).not.toHaveCount(0);
            await expect(page.getByText(':The enzymatic processing of a polypeptide chain')).not.toHaveCount(0);
            await expect(page.locator("//*[@id='searchResult_0']//strong[.='enzymatic']")).toBeVisible();
        });
    });

    test(`url search`, async ({ baseURL, page, navigationMenu, searchPage }) => {
        await navigationMenu.login(Accounts.nlm);
        await page.goto(`${baseURL}/cde/search?regStatuses=Candidate&selectedOrg=caBIG`);

        await test.step(`Verify query parameters are in selected`, async () => {
            await expect(searchPage.registrationStatusFilterInput(`Candidate`)).toBeChecked();
            await expect(searchPage.activeFilterClassification().locator(searchPage.classificationText())).toHaveText(
                'caBIG'
            );
            await expect(searchPage.activeFilterRegistrationStatus()).toHaveText('Candidate');
        });
    });

    test.describe(`search from home page`, async () => {
        test(`CDE`, async ({ baseURL, page, navigationMenu, searchPage }) => {
            const searchTerm = 'Height Measurement';
            await navigationMenu.login(Accounts.nlm);
            await page.getByPlaceholder('Search by topic, keyword, or organization').fill(searchTerm);
            await page.locator('id=search.submit').click();

            await test.step(`Verify search page`, async () => {
                await expect(searchPage.activeSearchTerm().locator(searchPage.searchTermText())).toHaveText(searchTerm);
            });

            await navigationMenu.formButton.click();
            await expect(searchPage.organizationBox).not.toHaveCount(0);
        });
        test(`Form`, async ({ baseURL, page, navigationMenu, searchPage }) => {
            const searchTerm = 'Blood Pressure';
            await navigationMenu.login(Accounts.nlm);
            await page.getByRole('button', { name: 'Search Forms' }).click();
            await page.getByPlaceholder('Search by topic, keyword, or organization').fill(searchTerm);
            await page.locator('id=search.submit').click();

            await test.step(`Verify search page`, async () => {
                await expect(searchPage.activeSearchTerm().locator(searchPage.searchTermText())).toHaveText(searchTerm);
            });

            await navigationMenu.cdeButton.click();
            await expect(searchPage.organizationBox).not.toHaveCount(0);
        });
    });

    test.describe(`with exclude org`, async () => {
        test(`exclude one org`, async ({ page, navigationMenu, searchPage }) => {
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoCdeSearch();
            await searchPage.browseOrganization('TEST');
            await searchPage.excludeFilterModeToggle().click();
            await searchPage.selectClassification('caBIG');
            await expect(page.locator('id=resultList')).not.toContainText('caBIG');
        });

        test(`exclude two orgs`, async ({ page, navigationMenu, searchPage }) => {
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoCdeSearch();
            await searchPage.browseOrganization('TEST');
            await searchPage.excludeFilterModeToggle().click();
            await searchPage.selectClassification('caBIG');
            await expect(page.locator('id=resultList')).not.toContainText('caBIG');
            await searchPage.selectClassification('ONC');
            await expect(page.locator('id=resultList')).not.toContainText('ONC');
        });

        test(`exclude all orgs`, async ({ page, navigationMenu, searchPage }) => {
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoCdeSearch();
            await searchPage.browseOrganization('TEST');
            await searchPage.excludeFilterModeToggle().click();
            await searchPage.excludeAllOrgsButton().click();
            await expect(page.locator('id=resultList')).not.toContainText('caBIG');
            await expect(page.locator('id=resultList')).not.toContainText('ONC');
            await expect(page.locator('id=resultList')).not.toContainText('CTEP');
        });
    });

    test(`bad query`, async ({ navigationMenu, searchPage }) => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.searchQueryInput().fill(`brain neoplasms\"$:{(.#%@!~`);
        await searchPage.searchSubmitButton().click();
        await expect(searchPage.searchTermText()).toHaveText('brain neoplasms');
    });

    test.describe(`search by created date`, async () => {
        test(`CDE`, async ({ navigationMenu, searchPage }) => {
            await navigationMenu.gotoCdeSearch();
            await searchPage.searchQueryInput().fill(`created:<1971`);
            await searchPage.searchSubmitButton().click();
            await expect(searchPage.noResultFoundMessage).toHaveText('No results were found.');
        });

        test(`form`, async ({ navigationMenu, searchPage }) => {
            await navigationMenu.gotoFormSearch();
            await searchPage.searchQueryInput().fill(`created:<1971`);
            await searchPage.searchSubmitButton().click();
            await expect(searchPage.searchResultInfoBar()).toHaveText('4 results. Sorted by relevance.');
        });
    });

    test.describe(`search by es query language`, async () => {
        test(`search with *`, async ({ navigationMenu, searchPage }) => {
            await navigationMenu.gotoCdeSearch();
            await searchPage.searchQueryInput().fill(`ISO2109`);
            await searchPage.searchSubmitButton().click();
            await expect(searchPage.noResultFoundMessage).toHaveText('No results were found.');

            await searchPage.searchQueryInput().fill(`ISO2109*`);
            await searchPage.searchSubmitButton().click();
            await expect(searchPage.searchResultInfoBar()).toHaveText('13 results. Sorted by relevance.');
        });
        test.describe(`search by date range`, async () => {
            test(`CDE`, async ({ navigationMenu, searchPage }) => {
                await navigationMenu.gotoCdeSearch();
                await searchPage.searchQueryInput().fill(`created:<2015-05-14`);
                await searchPage.searchSubmitButton().click();
                expect(await searchPage.numberOfResults()).toBeGreaterThan(850);

                await searchPage.searchQueryInput().fill(`created:<1960-05-13`);
                await searchPage.searchSubmitButton().click();
                await expect(searchPage.noResultFoundMessage).toHaveText('No results were found.');

                await searchPage.searchQueryInput().fill(`updated:<2015-09-21`);
                await searchPage.searchSubmitButton().click();
                await expect(searchPage.noResultFoundMessage).toHaveText('No results were found.');

                await searchPage.searchQueryInput().fill(`updated:<2015-09-22`);
                await searchPage.searchSubmitButton().click();
                expect(await searchPage.numberOfResults()).toBeGreaterThan(9790);

                await searchPage.searchQueryInput().fill(`imported:<2014-12-10`);
                await searchPage.searchSubmitButton().click();
                await expect(searchPage.noResultFoundMessage).toHaveText('No results were found.');

                await searchPage.searchQueryInput().fill(`imported:<2014-12-11`);
                await searchPage.searchSubmitButton().click();
                expect(await searchPage.numberOfResults()).toBeGreaterThan(330);
            });
            test(`Form`, async ({ navigationMenu, searchPage }) => {
                await navigationMenu.gotoFormSearch();
                await searchPage.searchQueryInput().fill(`created:<2015-01-01 AND created:>1980-01-01`);
                await searchPage.searchSubmitButton().click();
                expect(await searchPage.numberOfResults()).toBe(1);

                await searchPage.searchQueryInput().fill(`created:<1960-01-01`);
                await searchPage.searchSubmitButton().click();
                await expect(searchPage.noResultFoundMessage).toHaveText('No results were found.');

                await searchPage.searchQueryInput().fill(`updated:<2015-01-01`);
                await searchPage.searchSubmitButton().click();
                await expect(searchPage.noResultFoundMessage).toHaveText('No results were found.');

                await searchPage.searchQueryInput().fill(`updated:<2016-01-01`);
                await searchPage.searchSubmitButton().click();
                expect(await searchPage.numberOfResults()).toBe(4);

                await searchPage.searchQueryInput().fill(`imported:<2015-01-01`);
                await searchPage.searchSubmitButton().click();
                await expect(searchPage.noResultFoundMessage).toHaveText('No results were found.');

                await searchPage.searchQueryInput().fill(`imported:<2016-01-01`);
                await searchPage.searchSubmitButton().click();
                expect(await searchPage.numberOfResults()).toBe(2);
            });
        });

        test(`search number of PVs`, async ({
            page,
            materialPage,
            navigationMenu,
            searchPage,
            customizeTableModal,
        }) => {
            await navigationMenu.gotoCdeSearch();
            await searchPage.searchQueryInput().fill(`valueDomain.nbOfPVs: 249`);
            await searchPage.searchSubmitButton().click();
            await expect(searchPage.searchResultInfoBar()).toHaveText('1 results. Sorted by relevance.');
            await expect(page.locator('cde-summary-list-item')).toContainText('(249 total)');
            await page.getByRole('button', { name: 'Table View' }).click();
            await expect(page.getByText('Nb of PVs')).toBeVisible();
            await expect(page.locator('.nbOfPVs')).toHaveText('249');
        });

        test(`search number of questions`, async ({ page, navigationMenu, searchPage }) => {
            await navigationMenu.gotoFormSearch();
            await searchPage.searchQueryInput().fill(`numQuestions:>200`);
            await searchPage.searchSubmitButton().click();
            await expect(searchPage.searchResultInfoBar()).toHaveText('3 results. Sorted by relevance.');
            await expect(page.locator('cde-summary-list-item').first()).toContainText('239 Questions');
            await expect(page.locator('cde-summary-list-item').nth(1)).toContainText('218 Questions');
            await expect(page.locator('cde-summary-list-item').nth(2)).toContainText('360 Questions');
        });
    });

    test(`search by concept`, async ({ page, navigationMenu }) => {
        const cdeName = 'Classification Scheme Item Relationship Database Identifier java.lang.String';
        await navigationMenu.gotoCdeByName(cdeName);
        await page.getByText('Database', { exact: true }).click();
        await expect(page.getByText('3 results. Sorted by relevance.')).toBeVisible();
        await expect(page.getByText(cdeName)).toBeVisible();
    });
});
