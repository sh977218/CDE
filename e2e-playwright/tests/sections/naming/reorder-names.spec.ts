import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { move } from '../../../pages/util';

test.describe(`reorder name`, async () => {
    test(`CDE designation`, async ({ page, generateDetailsSection, navigationMenu }) => {
        const cdeName = 'Reorder designations cde';
        await navigationMenu.gotoCdeByName(cdeName, true);
        await navigationMenu.login(Accounts.testEditor);

        const cdeDesignationsLocator = page.getByTestId('designation-container').locator('cde-inline-view');
        const cdeNames = await cdeDesignationsLocator.allInnerTexts();

        await generateDetailsSection.reorderDesignations(0, 'down');
        move(cdeNames, 0, 1);
        await expect(cdeDesignationsLocator).toHaveText(cdeNames);

        await generateDetailsSection.reorderDesignations(2, 'up');
        move(cdeNames, 2, 1);
        await expect(cdeDesignationsLocator).toHaveText(cdeNames);

        await generateDetailsSection.reorderDesignations(2, 'top');
        move(cdeNames, 2, 0);
        await expect(cdeDesignationsLocator).toHaveText(cdeNames);
    });

    test(`Form definition`, async ({ page, generateDetailsSection, navigationMenu }) => {
        const formName = 'Reorder definition form';
        await navigationMenu.gotoFormByName(formName, true);
        await navigationMenu.login(Accounts.testEditor);

        const formDefinitionsLocator = page.getByTestId('definitions-container').locator('cde-text-truncate');
        const formDefinitions = await formDefinitionsLocator.allInnerTexts();

        await generateDetailsSection.reorderDefinitions(0, 'down');
        move(formDefinitions, 0, 1);
        await expect(formDefinitionsLocator).toHaveText(formDefinitions);

        await generateDetailsSection.reorderDefinitions(2, 'up');
        move(formDefinitions, 2, 1);
        await expect(formDefinitionsLocator).toHaveText(formDefinitions);

        await generateDetailsSection.reorderDefinitions(2, 'top');
        move(formDefinitions, 2, 0);
        await expect(formDefinitionsLocator).toHaveText(formDefinitions);
    });
});
