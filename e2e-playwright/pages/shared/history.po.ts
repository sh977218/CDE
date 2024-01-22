import { Page } from '@playwright/test';
import { MaterialPo } from './material.po';

export class HistoryPo {
    protected page: Page;
    readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    historyTable() {
        return this.page.getByTestId('historyTable');
    }

    historyTableRows() {
        return this.page.locator(`[data-testid="historyTable"] tbody tr`);
    }

    /**
     * Description - Select 2 history table rows to compare
     * @param row1 - zero base index, first row to select
     * @param row2 - zero base index, second row to select
     */
    async selectHistoryTableRowsToCompare(row1: number, row2: number) {
        await this.historyTableRows().nth(row1).getByRole('checkbox').click();
        await this.historyTableRows().nth(row2).getByRole('checkbox').click();
        await this.page.getByRole('button', { name: 'Compare', exact: true }).click();
    }
}
