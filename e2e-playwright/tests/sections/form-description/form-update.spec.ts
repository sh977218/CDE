import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { Designation, Version } from '../../../model/type';

const rightNow = new Date().valueOf();

test.describe.configure({ retries: 0 });
test.use({ video: 'on', trace: 'on' });
test(`From update`, async ({
    page,
    saveModal,
    navigationMenu,
    generateDetailsSection,
    previewSection,
    formDescription,
}) => {
    test.fixme();
    const formName = `Form Form Update Test`;
    const cdeName = 'Illicit/non-prescription drug use indicator';
    const updatedDesignation: Designation = {
        designation: `designation updated on ${rightNow}`,
        sources: [],
        tags: [],
    };

    const cdeVersionInfo: Version = {
        newVersion: '2',
        changeNote: '[update cde name]',
    };
    const formVersionInfo: Version = {
        newVersion: '',
        changeNote: '[update question cde]',
    };
    await test.step(`Login`, async () => {
        await navigationMenu.login(Accounts.nlm);
    });

    await test.step(`Update subform's CDE`, async () => {
        await navigationMenu.gotoCdeByName(cdeName);
        await generateDetailsSection.editDesignationByIndex(0, updatedDesignation, { replace: true });
        await generateDetailsSection.editStewardOrg('NLM'); // open steward org, but did not change the value, triggered draft, bug @TODO
        await saveModal.publishNewVersionByType('cde', cdeVersionInfo);
    });

    await test.step(`Navigate to form`, async () => {
        await navigationMenu.gotoFormByName(formName);
        await expect(previewSection.previewDiv().getByText(updatedDesignation.designation)).toBeHidden();
    });

    await test.step(`Go to form description`, async () => {
        await previewSection.goToFormDescription();
        await expect(formDescription.sectionTitleSubform()).toContainText('(Outdated)');
        await expect(formDescription.sectionTitleSubform()).toContainText('(Outdated)');
    });

    await test.step(`Update subform`, async () => {
        await formDescription.updateQuestionOrSubform(formDescription.sectionTitleSubform());
    });

    await test.step(`Save form`, async () => {
        await formDescription.backToPreviewButton().click();
        await saveModal.publishNewVersionByType('form', formVersionInfo);
    });

    await test.step(`Verify CDE updated`, async () => {
        await expect(previewSection.previewDiv().getByText(updatedDesignation.designation)).toBeHidden();
    });
    await test.step(`Verify Form description`, async () => {
        await previewSection.goToFormDescription();
        await expect(page.getByRole('button', { name: 'Update' })).toHaveCount(0);
    });
});
