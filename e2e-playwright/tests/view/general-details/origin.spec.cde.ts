import test from '../../../fixtures/base-fixtures';
import user from '../../../data/user';
import cdeTinyId from '../../../data/cde-tinyId';
import formTinyId from '../../../data/form-tinyId';

const newOrigin = 'new origin ' + new Date();

async function editOrigin(cdePage, inlineEdit) {
    const originLocator = cdePage.origin();
    await inlineEdit.editIcon(originLocator).click();
    await inlineEdit.inputField(originLocator).fill(newOrigin);
    await inlineEdit.submitButton(originLocator).click();
}

test.describe(`Edit Origin`, async () => {
    test(`CDE page`, async ({cdePage, navigationMenu, inlineEdit}) => {
        const cdeName = 'Atherosclerosis Risk in Communities transient ischemic attack/stroke form (ARIC TIA) - speech loss slurred symptom indicator';
        await cdePage.goToCde(cdeTinyId[cdeName]);
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await editOrigin(cdePage, inlineEdit);
    })

    test(`Form page`, async ({cdePage, navigationMenu, inlineEdit}) => {
        const formName = 'Measures of Gas Exchange';
        await cdePage.goToForm(formTinyId[formName]);
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await editOrigin(cdePage, inlineEdit);
    })
})
