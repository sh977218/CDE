import { Locator, Page } from '@playwright/test';

export class PermissibleValuePo {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    importPermissibleValueFromCDdeButton() {
        return this.page.getByRole('button', { name: ' Import PVs From CDE ' });
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
}
