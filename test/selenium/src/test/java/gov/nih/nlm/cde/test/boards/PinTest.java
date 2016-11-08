package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinTest extends BoardTest {

    @Test
    public void pinCdeIntoBoard() {
        mustBeLoggedInAs(pinUser, password);
        goToBoard("Smoking Board");
        Assert.assertEquals(driver.findElements(By.cssSelector("div.singleSearchResult")).size(), 2);
        textPresent("Smoking History");
        textPresent("Form Element End Date");

        goToBoard("Blood Board");
        Assert.assertEquals(driver.findElements(By.cssSelector("div.singleSearchResult")).size(), 2);
        textPresent("Laboratory Procedure Blood Urea Nitrogen");
        textPresent("Umbilical Cord Blood");

        goToCdeByName("School special accommodation indicator");
        clickElement(By.id("addToBoard"));
        textPresent("Choose a Board to pin this element to");
        clickElement(By.linkText("Blood Board"));
        textPresent("Added to Board");
        modalGone();
        closeAlert();

        goToBoard("Blood Board");
        textPresent("School special accommodation indicator");

    }
}
