package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NoDoublePinTest extends BoardTest {

    @Test
    public void noDoublePin() {
        mustBeLoggedInAs(doublepinuser_username, password);
        goToCdeSearch();
        String cdeName = "Specimen Inflammation Change Type";
        String boardName = "Double Pin Board";

        goToCdeByName(cdeName);
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to " + boardName);

        goToCdeSearch();
        openCdeInList(cdeName);
        clickElement(By.id("pinToBoard_0"));

        textPresent("Already added");

        goToBoard(boardName);
        Assert.assertEquals(driver.findElements(By.cssSelector("div.singleSearchResult")).size(), 1);
    }

}
