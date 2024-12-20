import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

const statement = 'Never ever share this form ' + new Date();
const authority = 'Patent for truth ' + new Date();
const url = 'https://search.nih.gov/search?commit=Search&query=' + new Date();

test.describe.configure({ retries: 0 });
test.use({ video: 'on', trace: 'on' });
test(`Edit Form Copyright`, async ({ navigationMenu, searchPage, generateDetailsSection, saveModal }) => {
    const formName = 'Quantitative Sensory Testing (QST)';

    await test.step(`Form is in 'Public domain, free to use'`, async () => {
        await navigationMenu.gotoFormSearch();
        await searchPage.searchWithString(`"${formName}"`);
        await expect(searchPage.copyrightStatusFilter('Public domain, free to use').first()).toBeVisible();
        await expect(searchPage.copyrightStatusFilter('Copyrighted, but free to use').first()).toBeHidden();
        await expect(searchPage.copyrightStatusFilter('Copyrighted, with restrictions').first()).toBeHidden();
    });

    await test.step(`Login`, async () => {
        await navigationMenu.login(Accounts.nlm);
    });

    await test.step(`Go to form and edit copyright`, async () => {
        await navigationMenu.gotoFormByName(formName);
        await generateDetailsSection.editCopyright({
            copyright: true,
            statement,
            authority,
            url,
        });

        await generateDetailsSection.addCopyright({ url: 'https://www.nlm.nih.gov' });
        await generateDetailsSection.addCopyright({ url: 'https://www.nih.gov/' });
        await generateDetailsSection.addCopyright({ url: 'https://www.hhs.gov/' });
        await generateDetailsSection.addCopyright({ url: 'https://www.usa.gov/' });

        await test.step(`Publish form`, async () => {
            await saveModal.publishNewVersionByType('form');
        });

        await test.step(`Form is in 'Copyrighted, but free to use'`, async () => {
            await navigationMenu.gotoFormSearch();
            await searchPage.searchWithString(`"${formName}"`);
            await expect(searchPage.copyrightStatusFilter('Public domain, free to use').first()).toBeHidden();
            await expect(searchPage.copyrightStatusFilter('Copyrighted, but free to use').first()).toBeVisible();
            await expect(searchPage.copyrightStatusFilter('Copyrighted, with restrictions').first()).toBeHidden();
        });

        await test.step(`Delete 'hhs url'`, async () => {
            await navigationMenu.gotoFormByName(formName);
            await generateDetailsSection
                .copyrightUrl()
                .nth(3)
                .locator(generateDetailsSection.copyrightUrlDelete())
                .click();
            await saveModal.waitForDraftSaveComplete();
        });

        await test.step(`Publish form`, async () => {
            await saveModal.publishNewVersionByType('form');
        });

        await test.step(`Verify 'hhs url' is not there`, async () => {
            await expect(generateDetailsSection.copyrightUrlContainer().getByText(`https://www.hhs.gov/`)).toBeHidden();
        });
    });

    await test.step(`Go to form and edit noRenderAllow`, async () => {
        await navigationMenu.gotoFormByName(formName);
        await generateDetailsSection.disallowRenderingCheckbox().check();

        await test.step(`Publish form`, async () => {
            await saveModal.publishNewVersionByType('form');
        });

        await test.step(`Form is in 'Copyrighted, with restrictions'`, async () => {
            await navigationMenu.gotoFormSearch();
            await searchPage.searchWithString(`"${formName}"`);
            await expect(searchPage.copyrightStatusFilter('Public domain, free to use').first()).toBeHidden();
            await expect(searchPage.copyrightStatusFilter('Copyrighted, but free to use').first()).toBeHidden();
            await expect(searchPage.copyrightStatusFilter('Copyrighted, with restrictions').first()).toBeVisible();
        });
    });
});
