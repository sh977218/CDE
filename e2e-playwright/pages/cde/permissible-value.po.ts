import { Locator, Page } from '@playwright/test';
import { PermissibleValue } from '../../model/type';
import { InlineEditPo } from '../shared/inline-edit.po';
import { SaveModalPo } from '../shared/save-modal.po';
import { MaterialPo } from '../shared/material.po';

export class PermissibleValuePo {
    private readonly page: Page;
    private readonly inlineEdit: InlineEditPo;
    private readonly saveModal: SaveModalPo;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo, inlineEdit: InlineEditPo, saveModal: SaveModalPo) {
        this.page = page;
        this.materialPage = materialPage;
        this.inlineEdit = inlineEdit;
        this.saveModal = saveModal;
    }

    importPermissibleValueFromCDdeButton() {
        return this.page.getByRole('button', { name: ' Import PVs From CDE ' });
    }

    validateAgainstUmlsButton() {
        return this.page.getByTestId(`validate-against-UMLS-button`);
    }

    umlsValidationResult() {
        return this.page.getByTestId(`umls-validation-result`);
    }

    addPermissibleValueButton() {
        return this.page.getByTestId('openAddPermissibleValueModelBtn');
    }

    valueMeaningNameInput() {
        return this.page.getByTestId('valueMeaningNameInput');
    }

    permissibleValueSynonymsCheckbox(source: string) {
        return this.page
            .locator(`[data-testid="displayCode"]`, {
                hasText: source,
            })
            .locator('input');
    }

    permissibleValueSynonymsTds(tableRow: Locator, source: string) {
        return tableRow.locator(`[data-testid="${source.toLowerCase()}"]`);
    }

    permissibleValueTableRows() {
        return this.page.locator(`[data-testid="pvTable"] tbody tr`);
    }

    updateOidButton() {
        return this.page.getByRole('button', { name: 'Update O.I.D' });
    }

    oidInput() {
        return this.page.getByPlaceholder('VSAC O.I.D');
    }

    oidCheckIcon() {
        return this.page.locator(`id=vsacIdCheck`);
    }

    oidResultTable() {
        return this.page.locator(`id=vsacTableBody`);
    }

    removeOidMappingButton() {
        return this.page.getByRole('button', { name: 'Remove Mapping' });
    }

    async updateOid(oid: string) {
        await this.updateOidButton().click();
        await this.oidInput().fill(oid);
        await this.oidCheckIcon().click();
    }

    /**
     *
     * @param index - zero based index
     * @param pv
     */
    async editPvByIndex(
        index: number,
        pv: PermissibleValue = {
            permissibleValue: '',
            valueMeaningDefinition: '',
            conceptId: '',
            conceptSource: '',
            valueMeaningCode: '',
            codeSystemName: '',
        }
    ) {
        const { permissibleValue, valueMeaningDefinition, conceptId, conceptSource, valueMeaningCode, codeSystemName } =
            pv;
        const pvRow = this.permissibleValueTableRows().nth(index);
        if (permissibleValue) {
            const pvCell = pvRow.getByTestId('pvValue');
            await this.inlineEdit.editInlineEdit(pvCell, permissibleValue);
            await this.saveModal.waitForDraftSaveComplete();
        }
        if (valueMeaningDefinition) {
            const pvCell = pvRow.getByTestId('pvMeaningDefinition');
            await this.inlineEdit.editInlineEdit(pvCell, valueMeaningDefinition);
            await this.saveModal.waitForDraftSaveComplete();
        }
        if (conceptId) {
            const pvCell = pvRow.getByTestId('pvConceptId');
            await this.inlineEdit.editInlineEdit(pvCell, conceptId);
            await this.saveModal.waitForDraftSaveComplete();
        }
        if (conceptSource) {
            const pvCell = pvRow.getByTestId('pvConceptSource');
            await this.inlineEdit.editInlineEdit(pvCell, conceptSource);
            await this.saveModal.waitForDraftSaveComplete();
        }
        if (valueMeaningCode) {
            const pvCell = pvRow.getByTestId('pvMeaningCode');
            await this.inlineEdit.editInlineEdit(pvCell, valueMeaningCode);
            await this.saveModal.waitForDraftSaveComplete();
        }
        if (codeSystemName) {
            const pvCell = pvRow.getByTestId('pvCodeSystem');
            await this.inlineEdit.editInlineEdit(pvCell, codeSystemName);
            await this.saveModal.waitForDraftSaveComplete();
        }
    }

    async addPv(
        pv: PermissibleValue = {
            permissibleValue: '',
            valueMeaningDefinition: '',
            conceptId: '',
            conceptSource: '',
            valueMeaningCode: '',
            codeSystemName: '',
        }
    ) {
        const {
            permissibleValue = `Default pv because it's is required`,
            valueMeaningDefinition = `Default description because it's is required`,
            conceptId,
            conceptSource,
            valueMeaningCode,
            codeSystemName,
        } = pv;
        await this.addPermissibleValueButton().click();
        await this.materialPage.matDialog().waitFor();

        await this.materialPage.matDialog().getByPlaceholder('Permissible Value').fill(permissibleValue);
        await this.materialPage.matDialog().getByPlaceholder('Description').fill(valueMeaningDefinition);
        if (conceptId) {
            await this.materialPage.matDialog().getByPlaceholder('Concept ID').fill(conceptId);
        }
        if (conceptSource) {
            await this.materialPage.matDialog().getByPlaceholder('Concept Source').fill(conceptSource);
        }
        if (valueMeaningCode) {
            await this.materialPage.matDialog().getByPlaceholder('PV Code').fill(valueMeaningCode);
        }
        if (codeSystemName) {
            await this.materialPage.matDialog().getByPlaceholder('Code System').fill(codeSystemName);
        }
        await this.materialPage
            .matDialog()
            .getByRole('button', {
                name: 'Save',
            })
            .click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
    }
}
