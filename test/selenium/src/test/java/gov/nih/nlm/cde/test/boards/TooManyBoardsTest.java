package gov.nih.nlm.cde.test.boards;

import org.testng.annotations.Test;

public class TooManyBoardsTest extends BoardTest {

    @Test
    public void tooManyBoards() {
        mustBeLoggedInAs("boardBot", password);
        gotoMyBoards();
        createBoard("BoardBots successfull board", "This board should be created!");
        createBoard("Failboard!", "This board will disappear!", "You have too many boards!");
    }

}
