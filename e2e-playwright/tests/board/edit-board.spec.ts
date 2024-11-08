import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';
import { Board } from '../../model/type';
import { expect } from '@playwright/test';

test.describe(`edit board`, async () => {
    test(`edit board`, async ({ page, navigationMenu, myBoardPage }) => {
        const newBoard: Board = {
            boardName: 'NEW Edit Board',
            boardDefinition: 'This board should be created! -- Desc Edited',
            type: 'CDEs',
            tags: ['tag1', 'tag2', 'tag3'],
        };

        await navigationMenu.login(Accounts.boarduserEdit);
        await navigationMenu.gotoMyBoard();
        await myBoardPage.editBoardByName('Edit Board', newBoard);
        await expect(page.getByText(newBoard.boardName)).not.toHaveCount(0);
        await expect(page.getByText(newBoard.boardDefinition)).not.toHaveCount(0);
    });
});
