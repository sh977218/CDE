import { BasePagePo } from '../../pages/base-page.po';
import { InlineEditPo } from '../../pages/shared/inline-edit.po';

export async function editOrigin(basePage: BasePagePo, inlineEdit: InlineEditPo, newOrigin: string) {
    const originLocator = basePage.origin();
    await inlineEdit.editIcon(originLocator).click();
    await inlineEdit.inputField(originLocator).fill(newOrigin);
    await inlineEdit.submitButton(originLocator).click();
}
