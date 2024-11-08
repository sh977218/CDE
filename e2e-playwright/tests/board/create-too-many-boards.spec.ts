import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';
import { Board } from '../../model/type';

test.describe(`create board`, async () => {
    test(`too many boards`, async ({ page, materialPage, navigationMenu, myBoardPage }) => {
        const board1: Board = {
            boardName: 'a 50th boards created',
            boardDefinition: 'This board should be created!',
            type: 'CDEs',
        };
        const board2: Board = {
            boardName: 'Fail boards!',
            boardDefinition: 'This board will disappear!',
            type: 'CDEs',
        };

        await navigationMenu.login(Accounts.boardBot);
        await navigationMenu.gotoMyBoard();
        await myBoardPage.createBoardSuccess(board1);
        await myBoardPage.createBoardFail(board2);
    });
});
