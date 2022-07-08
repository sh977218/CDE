package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinCdeIntoBoardTest extends BoardTest {

    @Test
    public void pinCdeIntoBoard() {
        String boardName = "Blood Board";
        String cdeName = "School special accommodation indicator";
        mustBeLoggedInAs(pinUser, password);

        goToBoard(boardName);
        Assert.assertEquals(driver.findElements(By.cssSelector("div.singleSearchResult")).size(), 2);
        textNotPresent(cdeName);

        goToCdeByName(cdeName);
        pinToBoardFromViewPageWithModal(boardName);

        goToBoard(boardName);
        textPresent(cdeName);
    }

}
