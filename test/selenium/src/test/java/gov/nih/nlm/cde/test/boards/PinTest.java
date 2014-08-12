package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinTest extends BoardTest {
    
    @Test
    public void pin() {
        mustBeLoggedInAs(boardUser, boardPassword);
        goToSearch();
        createBoard("Blood Board", "Collect blood related cdes here");
        createBoard("Smoking Board", "Collect Smoking CDEs here");
        
        gotoMyBoards();
        
        Assert.assertTrue(textPresent("Collect blood"));
        Assert.assertTrue(textPresent("Smoking CDEs"));

        pinTo("Laboratory Procedure Blood Urea Nitrogen", "Blood Board");
        pinTo("Umbilical Cord Blood", "Blood Board");
        pinTo("Smoking History Ind", "Smoking Board");
        pinTo("Form Element End Date", "Smoking Board");
        
        goToBoard("Smoking Board");
        Assert.assertEquals(driver.findElements(By.cssSelector("div.panel-default")).size(), 2);
        Assert.assertTrue(textPresent("Smoking History"));
        Assert.assertTrue(textPresent("Form Element End Date"));

        goToBoard("Blood Board");
        Assert.assertEquals(driver.findElements(By.cssSelector("div.panel-default")).size(), 2);
        Assert.assertTrue(textPresent("Laboratory Procedure Blood Urea Nitrogen"));
        Assert.assertTrue(textPresent("Umbilical Cord Blood"));
        
        removeBoard("Blood Board");
        removeBoard("Smoking Board");

    }

    @Test
    public void noDoublePin() {
        mustBeLoggedInAs(boardUser, boardPassword);
        goToSearch();
        String cdeName = "Specimen Array";
        String boardName = "Double Pin Board";
        
        createBoard(boardName, "test");
        pinTo(cdeName, boardName);
        
        goToSearch();
        openCdeInList(cdeName);
        findElement(By.id("pin_0")).click();
        modalHere();
        findElement(By.linkText(boardName)).click();
        
        Assert.assertTrue(textPresent("Already added"));
        modalGone();
        
        goToBoard(boardName);
        Assert.assertEquals(driver.findElements(By.cssSelector("div.panel-default")).size(), 1);
        
        removeBoard(boardName);
    }
    
    @Test
    public void unpin() {
        mustBeLoggedInAs(boardUser, boardPassword);
        goToSearch();
        createBoard("Unpin Board", "test");
        pinTo("Volumetric", "Unpin Board");
        goToBoard("Unpin Board");
        Assert.assertTrue(textPresent("Volumetric"));
        findElement(By.id("unpin_0")).click();
        goToBoard("Unpin Board");
        Assert.assertTrue(textNotPresent("Volumetric"));
        
        removeBoard("Unpin Board");
    }
        
    
}
