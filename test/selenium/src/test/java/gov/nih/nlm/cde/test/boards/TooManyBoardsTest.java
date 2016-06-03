package gov.nih.nlm.cde.test.boards;

import org.testng.annotations.Test;

public class TooManyBoardsTest extends BoardTest {

    @Test
    public void tooManyBoards() {
        mustBeLoggedInAs(boardBot_username, password);
        gotoMyBoards();
        createBoard("a 50th board created", "This board should be created!");
        createBoard("Fail board!", "This board will disappear!", "You have too many boards!");
    }

}
