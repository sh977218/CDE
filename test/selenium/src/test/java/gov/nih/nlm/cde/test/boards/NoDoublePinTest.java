package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NoDoublePinTest extends BoardTest {

    @Test
    @RecordVideo
    public void noDoublePin() {
        mustBeLoggedInAs("doublepinuser", password);
        goToCdeSearch();
        String cdeName = "Specimen Array";
        String boardName = "Double Pin Board";

        createBoard(boardName, "test");
        pinTo(cdeName, boardName);

        goToCdeSearch();
        openCdeInList(cdeName);
        findElement(By.id("pinToBoard_0")).click();
        findElement(By.linkText(boardName)).click();

        textPresent("Already added");
        modalGone();

        goToBoard(boardName);
        Assert.assertEquals(driver.findElements(By.cssSelector("div.singleSearchResult")).size(), 1);

        removeBoard(boardName);
    }

}
