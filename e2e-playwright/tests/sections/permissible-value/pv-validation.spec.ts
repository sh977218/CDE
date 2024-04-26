import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { expect } from '@playwright/test';
import { Version } from '../../../model/type';

test(`pv validation`, async ({ page, saveModal, materialPage, navigationMenu, permissibleValueSection }) => {
    const cdeName = 'PvValidatorCde';
    const versionInfo: Version = {
        newVersion: '',
        changeNote: '[cde pv validation]',
    };

    await test.step('Login and go to CDE', async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoCdeByName(cdeName);
    });

    await test.step('No validation error', async () => {
        await expect(page.getByText('There are validation errors')).toBeHidden();
    });

    await test.step(`Edit first PV to be duplicated PV and verify validation error`, async () => {
        await permissibleValueSection.editPvByIndex(0, { permissibleValue: 'pv2' });
        await expect(page.getByRole('alert')).toContainText(
            'The following errors need to be corrected in order to Publish:'
        );
        await expect(page.getByRole('alert')).toContainText('Duplicate Permissible Value: pv2');

        await test.step(`Should not allow to publish CDE when where is validation error`, async () => {
            await saveModal.publishDraftButton().click();
            await materialPage.checkAlert('Please fix all errors before publishing');
        });

        await test.step(`Revert back`, async () => {
            await permissibleValueSection.editPvByIndex(0, { permissibleValue: 'pv1' });
            await expect(page.getByRole('alert')).toBeHidden();
        });
    });

    await test.step(`Add duplicated PV and verify validation error`, async () => {
        await permissibleValueSection.addPv({
            permissibleValue: 'pv4',
            valueMeaningCode: 'code10',
            codeSystemName: 'NCI',
        });
        await expect(page.getByRole('alert')).toContainText(
            'The following errors need to be corrected in order to Publish:'
        );
        await expect(page.getByRole('alert')).toContainText('Duplicate Permissible Value: pv4');

        await test.step(`Should not allow to publish CDE when where is validation error`, async () => {
            await saveModal.publishDraftButton().click();
            await materialPage.checkAlert('Please fix all errors before publishing');
        });
        await test.step(`Revert back`, async () => {
            await permissibleValueSection.permissibleValueTableRows().last().getByTestId('remove-pv-button').click();
            await expect(page.getByRole('alert')).toBeHidden();
        });
    });

    await test.step(`Add duplicated PV code and verify validation error`, async () => {
        await permissibleValueSection.addPv({
            valueMeaningCode: 'code1',
            codeSystemName: 'NCI',
        });
        await expect(page.getByRole('alert')).toContainText(
            'The following errors need to be corrected in order to Publish:'
        );
        await expect(page.getByRole('alert')).toContainText('Duplicate Code: code1');

        await test.step(`Should not allow to publish CDE when where is validation error`, async () => {
            await saveModal.publishDraftButton().click();
            await materialPage.checkAlert('Please fix all errors before publishing');
        });

        await test.step(`Revert back`, async () => {
            await permissibleValueSection.permissibleValueTableRows().last().getByTestId('remove-pv-button').click();
            await expect(page.getByRole('alert')).toBeHidden();
        });
    });

    await test.step(`Save CDE`, async () => {
        await saveModal.newVersionByType('cde', versionInfo);
    });
});
