import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`Validate PV against UMLS`, async ({ navigationMenu, permissibleValueSection }) => {
    const cdeName = `Patient Ethnic Group Category`;
    await navigationMenu.login(Accounts.nlm);
    await navigationMenu.gotoCdeByName(cdeName);

    await permissibleValueSection.validateAgainstUmlsButtopn().click();
    await expect(permissibleValueSection.umlsValidationResult()).toContainText(`UMLS Validation Passed`);
});
