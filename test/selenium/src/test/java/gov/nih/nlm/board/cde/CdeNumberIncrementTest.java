package gov.nih.nlm.board.cde;

import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeNumberIncrementTest extends BoardTest {

    @Test
    public void cdeNumberIncrement() {
        String boardName = "Number Increment Board";
        mustBeLoggedInAs(boardUser, password);
        gotoMyBoards();
        int numBefore = getNumberElementsByBoardName(boardName);
        Assert.assertEquals(numBefore, 0);
        pinCdeToBoardWithModal("Lymph Node Procedure", boardName);
        gotoMyBoards();
        int numAfter = getNumberElementsByBoardName(boardName);
        Assert.assertEquals(numAfter, 1);
    }

}
