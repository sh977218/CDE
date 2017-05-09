package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NoDoublePinTest extends BoardTest {

    @Test
    public void noDoublePin() {
        mustBeLoggedInAs(doublepinuser_username, password);
        goToCdeSearch();
        String cdeName = "Specimen Array";
        String boardName = "Double Pin Board";

        pinCdeToBoard(cdeName, boardName);

        goToCdeSearch();
        openCdeInList(cdeName);
        clickElement(By.id("pinToBoard_0"));
        clickElement(By.linkText(boardName));

        textPresent("Already added");
        modalGone();

        goToBoard(boardName);
        Assert.assertEquals(driver.findElements(By.cssSelector("div.singleSearchResult")).size(), 1);
    }

}
