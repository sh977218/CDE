import { Page, Locator } from '@playwright/test';
import { Board } from '../../model/type';
import { MaterialPo } from '../shared/material.po';

export class MyBoardPagePo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    boardTitle(boardTitle: string): Locator {
        return this.page.locator(`[data-testid="board-title"]`, {
            has: this.page.locator(`text=${boardTitle}`),
        });
    }

    classifyAllCDEsButton() {
        return this.page.locator(`[id="board.classifyAllCdes"]`);
    }

    classifyAllFormsButton() {
        return this.page.locator(`[id="board.classifyAllForms"]`);
    }

    async createBoard({ boardName, boardDefinition, type }: Board) {
        await this.page.locator(`[id="addBoard"]`).click();
        await this.materialPage.matDialog().waitFor();
        await this.page.getByText(`Create New Board`).waitFor();
        await this.page.locator(`[id="new-board-type"]`).selectOption(type);
        await this.page.locator(`[id="new-board-name"]`).fill(boardName);
        await this.page.locator(`[id="new-board-description"]`).fill(boardDefinition);
        await this.page.getByRole('button', { name: 'Save', exact: true }).click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.materialPage.checkAlert(`Board created.`);
    }
}
