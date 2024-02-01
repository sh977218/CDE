import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

const statement = 'Never ever share this form ' + new Date();
const authority = 'Patent for truth ' + new Date();
const url = 'https://search.nih.gov/search?commit=Search&query=' + new Date();

test(`Edit Form Copyright`, async ({ navigationMenu, generateDetailsSection, saveModal }) => {
    const formName = 'Quantitative Sensory Testing (QST)';

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

        await test.step(`Publish form`, async () => {
            await saveModal.newVersion('Form saved.');
        });
    });
});
