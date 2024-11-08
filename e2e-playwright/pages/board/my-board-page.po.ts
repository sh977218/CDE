import { Page, Locator, expect } from '@playwright/test';
import { Board, ReorderDirection } from '../../model/type';
import { MaterialPo } from '../shared/material.po';
import { DUPLICATE_PINS, SINGLE_PIN } from '../../data/constants';

export class MyBoardPagePo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    boardBox(boardName: string) {
        return this.page.locator(`cde-board-overview`, { has: this.boardTitle(boardName) });
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

    /**
     *
     * @param board - the board try to be created
     * @param errorCode - "1": too many board
     */
    async createBoardFail(board: Board, errorCode = 1) {
        await this.createBoard(board);
        if (errorCode === 1) {
            await this.materialPage.checkAlert(`You have too many boards!`);
        }
    }

    async createBoardSuccess(board: Board) {
        await this.createBoard(board);
        await this.materialPage.checkAlert(`Board created.`);
    }

    private async createBoard({ boardName, boardDefinition, type }: Board) {
        await this.page.locator(`[id="addBoard"]`).click();
        await this.materialPage.matDialog().waitFor();
        await this.page.getByText(`Create New Board`).waitFor();
        await this.page.locator(`[id="new-board-type"]`).selectOption(type);
        await this.page.locator(`[id="new-board-name"]`).fill(boardName);
        await this.page.locator(`[id="new-board-description"]`).fill(boardDefinition);
        await this.page.getByRole('button', { name: 'Save', exact: true }).click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
    }

    async editBoardByName(boardNameToBeEdited: string, newBoard: Board) {
        const boardLocator = this.boardBox(boardNameToBeEdited);
        await boardLocator.locator('mat-icon', { hasText: 'edit' }).click();
        await this.materialPage.matDialog().waitFor();
        await this.materialPage.matDialog().getByPlaceholder('Board Name').fill(newBoard.boardName);
        await this.materialPage.matDialog().getByPlaceholder('Board Description').fill(newBoard.boardDefinition);
        if (newBoard.public) {
            await this.materialPage.matDialog().locator('id=makePublicBtn').click();
        } else {
            await this.materialPage.matDialog().locator('id=makePrivateBtn').click();
        }
        if (newBoard.tags) {
            for (const tag of newBoard.tags) {
                await this.materialPage.addMatChipRowByName(this.materialPage.matDialog().locator('cde-tag'), tag);
            }
        }

        await this.materialPage
            .matDialog()
            .getByRole('button', {
                name: 'Save',
            })
            .click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.materialPage.checkAlert('Saved.');
    }

    async selectBoardToPin(boardName: string, alertMessageCode = SINGLE_PIN) {
        await this.materialPage.matDialog().waitFor();
        await this.materialPage
            .matDialog()
            .locator("//*[@id='" + boardName + "']//mat-card-title")
            .click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        if (alertMessageCode === SINGLE_PIN) {
            await this.materialPage.checkAlert(`Pinned to ${boardName}`);
        } else if (alertMessageCode === DUPLICATE_PINS) {
            await this.materialPage.checkAlert(`Already added`);
        } else {
            await this.materialPage.checkAlert(`All elements pinned to ${boardName}`);
        }
    }

    async deleteBoardByName(boardName: string) {
        await this.page.locator("//*[@id='" + boardName + "']//*[contains(@class,'deleteBoard')]").click();
        await this.page.locator('id=saveDeleteBoardBtn').click();
        await this.materialPage.checkAlert('Deleted.');
        await expect(this.page.getByText(boardName)).toHaveCount(0);
    }

    async reorderPin(index: number, direction: string) {
        const map: Record<string, string> = {
            down: 'Down',
            up: 'Up',
            top: 'Move to top',
        };
        const moveIcon = this.page
            .locator('cde-summary-heading')
            .nth(index)
            .locator('cde-list-sort')
            .getByTitle(map[direction]);
        await moveIcon.click();
        await this.materialPage.checkAlert('Saved');
    }
}
