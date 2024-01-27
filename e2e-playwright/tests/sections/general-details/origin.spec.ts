import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

const newOrigin = 'new origin ' + new Date();

test.describe(`Edit Origin`, async () => {
    test(`CDE page`, async ({ cdePage, generateDetailsSection, navigationMenu, inlineEdit }) => {
        const cdeName =
            'Atherosclerosis Risk in Communities transient ischemic attack/stroke form (ARIC TIA) - speech loss slurred symptom indicator';
        await navigationMenu.gotoCdeByName(cdeName);
        await navigationMenu.login(Accounts.nlm);
        await generateDetailsSection.editOrigin(newOrigin);
    });

    test(`Form page`, async ({ formPage, generateDetailsSection, navigationMenu, inlineEdit }) => {
        const formName = 'Measures of Gas Exchange';
        await navigationMenu.gotoFormByName(formName);
        await navigationMenu.login(Accounts.nlm);
        await generateDetailsSection.editOrigin(newOrigin);
    });
});
