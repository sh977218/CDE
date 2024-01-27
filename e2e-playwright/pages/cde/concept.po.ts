import { Page } from '@playwright/test';
import { Concept, ConceptType, ReorderDirection } from '../../model/type';
import { MaterialPo } from '../shared/material.po';
import { SaveModalPo } from '../shared/save-modal.po';

const CONCEPT_TYPE_MAP = {
    'Object Class': 'Class',
    Property: 'Property',
    'Data Element Concept': 'Data Element',
};

export class ConceptPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;
    private readonly saveModal: SaveModalPo;

    constructor(page: Page, materialPage: MaterialPo, saveModal: SaveModalPo) {
        this.page = page;
        this.materialPage = materialPage;
        this.saveModal = saveModal;
    }

    async addNewConcept(concept: Concept) {
        await this.page.getByRole(`button`, { name: 'Add Concept', exact: true }).click();
        await this.materialPage.matDialog().waitFor();
        await this.page.getByPlaceholder('Concept Code Name').fill(concept.conceptName);
        await this.page.getByPlaceholder('Concept Code Identifier').fill(concept.conceptId);
        if (concept.conceptSource) {
            await this.page.getByPlaceholder('Code System').fill(concept.conceptSource);
        }
        await this.page.getByPlaceholder(`Concept Type`).click();
        await this.materialPage.matOptionByText(CONCEPT_TYPE_MAP[concept.conceptType]).click();
        await this.materialPage.matDialog().getByRole('button', { name: 'Save', exact: true }).click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.saveModal.waitForDraftSaveComplete();
    }

    /**
     * Description - Remove concept by type and index
     * @param conceptType - Concept Type
     * @param index - zero base index
     */
    async removeConceptByIndex(conceptType: ConceptType, index: number) {
        await this.page
            .locator(`cde-concepts table tbody tr`, {
                has: this.page.locator(`td`, {
                    hasText: conceptType,
                }),
            })
            .nth(index)
            .getByTestId('remove-concept-button')
            .click();
        await this.saveModal.waitForDraftSaveComplete();
    }

    async reorderConceptByIndex(index: number, direction: ReorderDirection) {
        await this.page
            .locator(`cde-concepts table tbody tr`)
            .nth(index)
            .getByRole('button', {
                name: direction,
                exact: true,
            })
            // .getByAltText(direction, {exact: true})
            .click();
        await this.saveModal.waitForDraftSaveComplete();
    }
}
