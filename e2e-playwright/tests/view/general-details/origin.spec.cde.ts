import test from '../../../fixtures/base-fixtures';
import user from '../../../data/user';
import cdeTinyId from '../../../data/cde-tinyId';
import formTinyId from '../../../data/form-tinyId';
import { editOrigin } from '../../utility/edit-origin';

const newOrigin = 'new origin ' + new Date();

test.describe(`Edit Origin`, async () => {
    test(`CDE page`, async ({cdePage, navigationMenu, inlineEdit}) => {
        const cdeName =
            'Atherosclerosis Risk in Communities transient ischemic attack/stroke form (ARIC TIA) - speech loss slurred symptom indicator';
        await cdePage.goToCde(cdeTinyId[cdeName]);
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await editOrigin(cdePage, inlineEdit, newOrigin);
    });

    test(`Form page`, async ({formPage, navigationMenu, inlineEdit}) => {
        const formName = 'Measures of Gas Exchange';
        await formPage.goToForm(formTinyId[formName]);
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await editOrigin(formPage, inlineEdit, newOrigin);
    });
});