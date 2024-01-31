import { Page } from '@playwright/test';
import { CreateElt } from '../../model/type';
import { MaterialPo } from '../shared/material.po';

export class CreateEltPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    eltNameInput() {
        return this.page.locator(`[id="eltName"]`);
    }

    eltDefinitionInput() {
        return this.page.locator(`[id="eltDefinition"]`);
    }

    eltStewardOrgNameSelect() {
        return this.page.locator(`[id="eltStewardOrgName"]`);
    }

    openClassifyModalButton() {
        return this.page.locator(`[id="openClassificationModalBtn"]`);
    }

    submitButton() {
        return this.page.locator(`[id="submit"]`);
    }

    validationError() {
        return this.page.locator(`[data-testid="validation-error"]`);
    }

    /**
     *
     * @param eltName designation
     * @param eltDef definition
     * @param eltOrg steward org
     * @param eltClassificationCategories classification array exclude org name
     */
    async createElt({ eltName, eltDef, eltOrg, eltClassificationCategories }: CreateElt) {
        await this.eltNameInput().fill(eltName);
        await this.eltDefinitionInput().fill(eltDef);
        await this.eltStewardOrgNameSelect().selectOption(eltOrg);
        await this.openClassifyModalButton().click();
        await this.materialPage.classifyItemByOrgAndCategories(eltOrg, eltClassificationCategories);
        await this.submitButton().click();
    }
}
