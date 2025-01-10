import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { Version } from '../../../model/type';

test.describe.configure({ retries: 0 });
test.use({ video: 'on', trace: 'on' });
test(`From add cde`, async ({ saveModal, navigationMenu, previewSection, formDescription }) => {
    test.slow();
    const formName = `formAddCdeTest`;
    const cdeNames = ['newCde2', 'newCde3', 'newCde4', 'newCde5'];
    const cdeSuggestedNames1 = ['pronounce smile', 'Patient Name'];
    const cdeSuggestedNames2 = [
        'Gastrointestinal therapy feed schedule start',
        'Diary day headache indic',
        'Patient Gender Code',
    ];

    const versionInfo: Version = {
        newVersion: '',
        changeNote: '[add form question]',
    };
    await test.step(`Login and navigate to form`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoFormByName(formName);
    });
    await test.step(`Go to form description`, async () => {
        await previewSection.goToFormDescription();
    });

    await test.step(`Add new CDEs`, async () => {
        for (const [i, cdeName] of cdeNames.entries()) {
            if (i === 0) {
                await formDescription.addQuestionByNameBeforeId(cdeName, 'question_0-0');
            } else {
                // add reset of CDEs by using keyboard shortcut
                await formDescription.addQuestionByNameHotKey(cdeName);
            }
        }

        await test.step(`Edit first new CDE`, async () => {
            const questionId = 'question_0-1';
            await formDescription.startEditQuestionById(questionId);
            await formDescription.addNewDesignationByQuestionId(questionId, 'newCde2 second name');
            await formDescription.addNewIdentifierByQuestionId(questionId, 'newCde2Source', 'newCde2Id');
            await formDescription.editCdeDataTypeById(questionId, 'Date');
        });

        await test.step(`Edit second new CDE`, async () => {
            const questionId = 'question_0-2';
            await formDescription.startEditQuestionById(questionId);
            await formDescription.addNewDesignationByQuestionId(questionId, 'newCde3 second name');
            await formDescription.addNewDesignationByQuestionId(questionId, 'newCde3 third name');
            await formDescription.deleteCdeNameById(questionId, 'newCde3 third name');
            await formDescription.addNewIdentifierByQuestionId(questionId, 'newCde3Source', 'newCde3Id');
            await formDescription.addNewIdentifierByQuestionId(questionId, 'newCde3Source3', 'newCde3Id3');
            await formDescription.deleteCdeIdentifierById(questionId, 'newCde3Source', 'newCde3Id');
            await formDescription.editCdeDataTypeById(questionId, 'Number');
        });

        await test.step(`Edit third new CDE`, async () => {
            const questionId = 'question_0-3';
            await formDescription.startEditQuestionById(questionId);
            await formDescription.editCdeDataTypeById(questionId, 'Value List');
            await formDescription.addCdePvById(questionId, '1');
            await formDescription.addCdePvById(questionId, '2');
            await formDescription.addCdePvById(questionId, '3');
            await formDescription.deleteCdePvById(questionId, '3');
        });
    });

    await test.step(`Add suggested CDEs`, async () => {
        await test.step(`Add suggested CDEs`, async () => {
            for (const [i, cdeSuggestedName] of cdeSuggestedNames1.entries()) {
                if (i === 0) {
                    await formDescription.addQuestionByNameBeforeIdSuggested(cdeSuggestedName, 'question_1-0');
                } else {
                    // add reset of CDEs by using keyboard shortcut
                    await formDescription.addQuestionByNameHotKeySuggested(cdeSuggestedName);
                }
            }
            await formDescription.addQuestionByNamesHotKeySuggested(cdeSuggestedNames2);
        });
    });

    await test.step(`Save form`, async () => {
        await formDescription.saveFormEdit();
        await saveModal.publishNewVersionByType('form', versionInfo);
    });

    await test.step(`Verify questions`, async () => {
        await previewSection.goToFormDescription();

        await expect(formDescription.questionLabelByIndex('question_0-0')).toHaveText(`newCde2`);

        await expect(formDescription.questionLabelByIndex('question_0-1')).toHaveText(`newCde3`);
        await expect(formDescription.questionDataTypeByIndex('question_0-1')).toHaveText('(Date)');

        await expect(formDescription.questionLabelByIndex('question_0-2')).toHaveText(`newCde4`);
        await expect(formDescription.questionDataTypeByIndex('question_0-2')).toHaveText('(Number)');

        await expect(formDescription.questionLabelByIndex('question_0-3')).toHaveText(`newCde5`);
        await expect(formDescription.questionAnswerListByIndex('question_0-3')).toHaveText(['1', '2']);

        await expect(formDescription.questionLabelByIndex('question_1-0')).toHaveText(`smile`);
        await expect(formDescription.questionAnswerListByIndex('question_1-0')).toHaveText([
            'word pronounced correctly',
            'word pronounced incorrectly',
        ]);

        await expect(formDescription.questionLabelByIndex('question_1-1')).toHaveText(`Patient Name`);

        await expect(formDescription.questionLabelByIndex('question_1-2')).toHaveText(`Patient Gender Code`);
        await expect(formDescription.questionAnswerListByIndex('question_1-2')).toHaveText([
            'Males',
            'Female',
            'Unknown',
        ]);

        await expect(formDescription.questionLabelByIndex('question_1-3')).toHaveText(`Headache`);
        await expect(formDescription.questionAnswerListByIndex('question_1-3')).toHaveText(['Yes', 'No', 'Unknown']);

        await expect(formDescription.questionLabelByIndex('question_1-4')).toHaveText(`Start of Feeding Schedule:`);
        await expect(formDescription.questionDataTypeByIndex('question_1-4')).toHaveText(`(Date)`);
    });

    await test.step(`Verify CDE creation`, async () => {
        for (const cdeName of cdeNames) {
            await navigationMenu.gotoCdeByName(cdeName);
        }
    });
});
