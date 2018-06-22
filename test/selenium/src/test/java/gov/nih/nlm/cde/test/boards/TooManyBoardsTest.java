package gov.nih.nlm.cde.test.boards;

import org.testng.annotations.Test;

public class TooManyBoardsTest extends BoardTest {

    @Test
    public void tooManyBoards() {
        mustBeLoggedInAs(boardBot_username, password);
        gotoMyBoards();
        createBoard("a 50th boards created", "This board should be created!", "cde");
        createBoard("Fail boards!", "This board will disappear!", "cde", "You have too many boards!");
    }

}
