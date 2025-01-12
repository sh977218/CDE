import { test } from '../../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Version } from '../../../model/type';
import { Accounts } from '../../../data/user';
import { FormTinyIds } from '../../../data/form-tinyId';

test(`Form description`, async ({
    page,
    materialPage,
    navigationMenu,
    itemLogAuditPage,
    auditTab,
    saveModal,
    previewSection,
    formDescription,
    historySection,
}) => {
    const formName = `Form Edit Section And Question Test`;
    const newInstruction = 'New Question Instruction';
    const newQuestionLabel = `Data unknown text`;
    const versionInfo: Version = {
        newVersion: '',
        changeNote: '[edit form question label, instruction]',
    };

    await test.step(`Navigate to Form description and login`, async () => {
        await navigationMenu.gotoFormByName(formName);
        await navigationMenu.login(Accounts.nlm);
        await previewSection.goToFormDescription();
    });

    await test.step(`Edit form question label and instruction`, async () => {
        await formDescription.startEditQuestionById('question_0-0');
        await formDescription.selectQuestionLabelByIndex('question_0-0', -1);
        await formDescription.selectQuestionLabelByIndex('question_0-0', 1);
        await formDescription.editQuestionInstructionByIndex('question_0-0', newInstruction);
    });

    await test.step(`Save form`, async () => {
        await formDescription.backToPreviewButton().click();
        await saveModal.publishNewVersionByType('form', versionInfo);
    });

    await test.step(`Verify history`, async () => {
        await page.getByRole('heading', { name: 'History' }).scrollIntoViewIfNeeded();
        await expect(historySection.historyTableRows().first()).toContainText(versionInfo.changeNote);

        await test.step(`Verify prior element`, async () => {
            const [newPage] = await Promise.all([
                page.context().waitForEvent('page'),
                historySection.historyTableRows().nth(1).locator('mat-icon').click(),
            ]);
            await newPage.waitForURL(/\/formView\?formId=*/);
            await expect(newPage.getByText(`this form is archived.`)).toBeVisible();
            await newPage.getByText(`view the current version here`).click();
            await expect(newPage).toHaveURL(`/formView?tinyId=${FormTinyIds[formName]}`);
            await expect(newPage.getByText(newQuestionLabel).first()).toBeVisible();
            await expect(newPage.getByText(newInstruction).first()).toBeVisible();
            await newPage.close();
        });
    });

    await test.step(`Verify Form audit`, async () => {
        await navigationMenu.logout();
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoAudit();
        await auditTab.formAuditLog().click();
        await page.route(`/server/log/itemLog/form`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await materialPage.matSpinnerShowAndGone();
        await itemLogAuditPage.expandLogRecordByName(formName);
        const detailLocator = page.locator(`.example-element-detail`);
        await expect(detailLocator.getByText(formName).first()).toBeVisible();
        await expect(detailLocator.getByText(newInstruction).first()).toBeVisible();
        await expect(detailLocator.getByText(newQuestionLabel).first()).toBeVisible();
    });
});
