package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NoDoublePinTest extends BoardTest {

    @Test
    public void noDoublePin() {
        mustBeLoggedInAs(pinUser, password);
        goToCdeSearch();
        String cdeName = "Specimen Array";
        String boardName = "Double Pin Board";

        createBoard(boardName, "test");
        pinTo(cdeName, boardName);

        goToCdeSearch();
        openCdeInList(cdeName);
        findElement(By.id("pin_0")).click();
        findElement(By.linkText(boardName)).click();

        Assert.assertTrue(textPresent("Already added"));
        modalGone();

        goToBoard(boardName);
        Assert.assertEquals(driver.findElements(By.cssSelector("div.panel-default")).size(), 1);

        removeBoard(boardName);
    }

}
