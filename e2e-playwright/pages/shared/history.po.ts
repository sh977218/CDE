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
}
