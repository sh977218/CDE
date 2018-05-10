package gov.nih.nlm.cde.test.boards;

import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeNumberIncrementTest extends BoardTest {

    @Test
    public void cdeNumberIncrement() {
        String boardName = "Number Increment Board";
        mustBeLoggedInAs(boardUser, password);
        gotoMyBoards();
        int numBefore = getNumberElementsByBoardName(boardName);
        Assert.assertEquals(0, numBefore);
        pinCdeToBoard("Lymph Node Procedure", boardName);
        gotoMyBoards();
        int numAfter = getNumberElementsByBoardName(boardName);
        Assert.assertEquals(1, numAfter);
    }

}
