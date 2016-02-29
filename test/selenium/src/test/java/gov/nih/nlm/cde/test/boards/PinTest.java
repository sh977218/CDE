package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinTest extends BoardTest {
    
    @Test(priority = -1)
    public void pin() {
        mustBeLoggedInAs(pinUser, password);

        createBoard("Blood Board", "Collect blood related cdes here");
        createBoard("Smoking Board", "Collect Smoking CDEs here");
        
        gotoMyBoards();
        
        textPresent("Collect blood");
        textPresent("Smoking CDEs");

        pinTo("Laboratory Procedure Blood Urea Nitrogen", "Blood Board");
        pinTo("Umbilical Cord Blood", "Blood Board");
        pinTo("Smoking History Ind", "Smoking Board");
        pinTo("Form Element End Date", "Smoking Board");
        
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
        findElement(By.linkText("Blood Board")).click();
        textPresent("Added to Board");
        modalGone();
        closeAlert();

        goToBoard("Blood Board");
        textPresent("School special accommodation indicator");

        removeBoard("Blood Board");
        removeBoard("Smoking Board");

    }

}
