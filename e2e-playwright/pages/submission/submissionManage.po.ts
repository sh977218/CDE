import { button } from '../../pages/util';
import { SubmissionEditPo } from './submissionEdit.po';
import { expect, Locator, Page } from '@playwright/test';

export class SubmissionManagePo {
    private readonly page: Page;
    submissionEditPo: SubmissionEditPo;

    constructor(page: Page) {
        this.page = page;
        this.submissionEditPo = new SubmissionEditPo(page);
    }

    badge(text: string): Locator {
        return this.page.locator(
            '//*[@role = "button"][contains(@class, "badge-outline-gray")][text()[normalize-space() = "' + text + '"]]'
        );
    }

    buttonCreateSubmission(): Locator {
        return button(this.page, 'Begin Submission');
    }

    buttonFilter(): Locator {
        return button(this.page, 'Filters');
    }

    buttonShowColumns(): Locator {
        return button(this.page, 'Show/Hide Columns');
    }

    async isSubmissionManagement() {
        await expect(this.page.locator('//h1[text()="NLM Organizational Authority Dashboard"]')).toBeVisible();
        await this.page.locator('//h2[contains(.," Collections")]').waitFor();
        await this.tableResultsAtLeast(10);
        expect(await this.tableCell('NINDS').count()).toBeGreaterThanOrEqual(1);
    }

    async isSubmissionManagementCurator() {
        await expect(this.page.locator('//h1[text()="NLM Organizational Authority Dashboard"]')).toBeVisible();
        await this.page.locator('//h2[contains(.," Collections")]').waitFor();
        await this.tableResultsAtLeast(2);
        expect(await this.tableCell('NLM').count()).toBeGreaterThanOrEqual(1);
    }

    async submissionEdit(name: string, version: string) {
        await this.tableAction(await this.submissionFindIndex(name, version)).click();
        await button(this.tableActionMenu(), 'Edit').click();
        this.submissionEditPo.isEdit();
        await this.submissionEditPo.isNameAndVersion(name, version);
    }

    private async submissionFindIndex(name: string, version: string): Promise<number> {
        const matches: boolean[] = await Promise.all(
            await this.tableRows()
                .all()
                .then(rows =>
                    rows.slice(1).map(async row => {
                        return (
                            (await row.locator('.cell').nth(1).textContent()) === name &&
                            (await row.locator('.cell').nth(6).textContent()) === version
                        );
                    })
                )
        );
        const index = matches.indexOf(true);
        if (index === -1) {
            return Promise.reject(`No match for submission name=${name} version=${version}`);
        }
        return index;
    }

    async submissionNew() {
        await this.buttonCreateSubmission().click();
        this.submissionEditPo.isNew();
    }

    async submissionView(name: string, version: string) {
        await this.tableAction(await this.submissionFindIndex(name, version)).click();
        await button(this.tableActionMenu(), 'View').click();
        this.submissionEditPo.isView();
        await this.submissionEditPo.isNameAndVersion(name, version);
    }

    tableAction(num: number): Locator {
        return this.page.locator('//*[contains(@class, "headingColumn")]').nth(num + 1);
    }

    tableActionMenu(): Locator {
        return this.page.locator('//*[contains(@class, "cellGroupAction")]');
    }

    tableCell(text: string): Locator {
        return this.page.locator('//*[contains(@class, "cell")][normalize-space() = "' + text + '"]');
    }

    tableHeading(text: string): Locator {
        return this.page.locator('//*[contains(@class, "headingRow")][text()[normalize-space() = "' + text + '"]]');
    }

    tableRows(): Locator {
        // includes heading row
        return this.page.locator('.cellGroup');
    }

    async tableResults(num: number): Promise<void> {
        expect(await this.tableRows().count()).toBe(num + 1);
    }

    async tableResultsAtLeast(num: number): Promise<void> {
        expect(await this.tableRows().count()).toBeGreaterThanOrEqual(num + 1);
    }
}
