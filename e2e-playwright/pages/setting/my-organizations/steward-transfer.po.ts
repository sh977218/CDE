import { Locator, Page } from '@playwright/test';
import { MaterialPo } from '../../../pages/shared/material.po';
import { Organization } from '../../../model/type';
import { InlineEditPo } from '../../../pages/shared/inline-edit.po';

export class StewardTransferPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    stewardTransferFrom() {
        return this.page.locator(`id=transferSteward_from`);
    }

    stewardTransferTo() {
        return this.page.locator(`id=transferSteward_to`);
    }

    transferButton() {
        return this.page.getByRole('button', { name: 'Transfer Now' });
    }

    async transferSteward(from: string, to: string, numberCdeTransferred = 0, numberFormTransferred = 0) {
        await this.stewardTransferFrom().selectOption(from);
        await this.stewardTransferTo().selectOption(to);
        await this.transferButton().click();
        await this.materialPage.checkAlert(
            `${numberCdeTransferred} CDEs transferred. ${numberFormTransferred} forms transferred.`
        );
    }
}
