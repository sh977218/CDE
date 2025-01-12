import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { Version } from '../../../model/type';

test.describe.configure({ retries: 0 });
test(`From add cde part of score`, async ({ saveModal, navigationMenu, previewSection, formDescription }) => {
    const formName = `ALS Score Form`;
    const totalScoreCde = 'ALS Severity Score (ALSSS) - total score value';
    const scoreCde1 = 'ALS Severity Score (ALSSS) - upper extremity dress hygiene score';
    const scoreCde2 = 'ALS Severity Score (ALSSS) - lower extremity walk score';
    const scoreCde3 = 'ALS Severity Score (ALSSS) - swallow score';

    await test.step(`Login and navigate to form`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoFormByName(formName);
    });
    await test.step(`Go to form description`, async () => {
        await previewSection.goToFormDescription();
    });

    await test.step(`Add new section`, async () => {
        await formDescription.addSection('Score Section');
    });

    await test.step(`Add total score CDE and verify validation error`, async () => {
        await formDescription.addQuestionToSection(totalScoreCde, 0);
        await expect(formDescription.warningAlertMessage()).toHaveText(
            'The following CDEs are part of a score but are missing from this form:'
        );
        await expect(formDescription.warningAlertDiv().locator('ul li')).toHaveText([
            'CDE 1,id: 5h29ApPjjzE,',
            'CDE 2,id: h7pThcFJv2r,',
            'CDE 3,id: cu_0EyndDn2,',
        ]);
        await expect(formDescription.questionDiv().last().locator(formDescription.questionRule())).toContainText(
            '(Incomplete Rule)'
        );
    });

    await test.step(`Add first score CDE and verify validation error`, async () => {
        await formDescription.addQuestionToSection(scoreCde1, 0);
        await expect(formDescription.warningAlertMessage()).toHaveText(
            'The following CDEs are part of a score but are missing from this form:'
        );
        await expect(formDescription.warningAlertDiv().locator('ul li')).toHaveText([
            'CDE 1,id: 5h29ApPjjzE,',
            'CDE 2,id: h7pThcFJv2r,',
        ]);
        await expect(formDescription.questionDiv().last().locator(formDescription.questionRule())).toContainText(
            '(Incomplete Rule)'
        );
    });

    await test.step(`Add reset score CDEs and validation errors are gone`, async () => {
        await formDescription.addQuestionToSection(scoreCde2, 0);
        await formDescription.addQuestionToSection(scoreCde3, 0);
        await expect(formDescription.warningAlertMessage()).toBeHidden();
        await expect(formDescription.questionDiv().last().locator(formDescription.questionRule())).toBeHidden();
    });

    await test.step(`Validation part of score`, async () => {
        await expect(formDescription.questionDiv().first().locator(formDescription.questionPartOf())).toHaveText(
            '(part of score)'
        );
        await expect(formDescription.questionDiv().nth(1).locator(formDescription.questionPartOf())).toHaveText(
            '(part of score)'
        );
        await expect(formDescription.questionDiv().nth(2).locator(formDescription.questionPartOf())).toHaveText(
            '(part of score)'
        );
    });
});
