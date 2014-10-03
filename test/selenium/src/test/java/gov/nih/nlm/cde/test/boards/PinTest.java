package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinTest extends BoardTest {
    
    @Test
    public void pin() {
        mustBeLoggedInAs(pinUser, pass);
        goToCdeSearch();
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
        mustBeLoggedInAs(pinUser, pass);
        goToCdeSearch();
        String cdeName = "Specimen Array";
        String boardName = "Double Pin Board";
        
        createBoard(boardName, "test");
        pinTo(cdeName, boardName);
        
        goToCdeSearch();
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
        mustBeLoggedInAs(pinUser, pass);
        goToCdeSearch();
        createBoard("Unpin Board", "test");
        pinTo("Volumetric", "Unpin Board");
        goToBoard("Unpin Board");
        Assert.assertTrue(textPresent("Volumetric"));
        findElement(By.id("unpin_0")).click();
        goToBoard("Unpin Board");
        Assert.assertTrue(textNotPresent("Volumetric"));
        
        removeBoard("Unpin Board");
    }
        
    
    @Test
    public void pinAll() {
        mustBeLoggedInAs(ninds_username, ninds_password);
        goToCdeSearch();
        createBoard("Cerebral Palsy > Public Review", "CDEs to be use for Cerebral Palsy");        
        goToCdeSearch();
        findElement(By.id("classifications-text-NINDS")).click();
        findElement(By.id("li-blank-Disease")).click();
        findElement(By.id("li-blank-General (For all diseases)")).click();
        findElement(By.id("pinAll")).click();
        findElement(By.linkText("Cerebral Palsy > Public Review")).click();
        modalGone();
        gotoMyBoards();
        findElement(By.xpath("//a[../dl/dd/div/div/span[contains(text(),'CDEs to be use for Cerebral Palsy')]]")).click();        
        Assert.assertTrue(driver.findElements(By.xpath("//h4[@class=\"panel-title\"]")).size()==13); 
        Assert.assertTrue(textPresent("Site number"));
        Assert.assertTrue(textPresent("Family income range"));
        Assert.assertTrue(textPresent("Risk Factor Questionnaire (RFQ) - age 66 and over residential history residence pesticide use frequency"));
        Assert.assertTrue(textPresent("Risk Factor Questionnaire (RFQ) - age 18 25 residential history residence pesticide use frequency"));
        Assert.assertTrue(textPresent("Traffic accident other party role type"));
        Assert.assertTrue(textPresent("Food Frequency Questionnaire - (FFQ)-vitamin E type"));
        Assert.assertTrue(textPresent("Family history medical condition relative type"));
        Assert.assertTrue(textPresent("Alcohol use frequency"));
    }    
}
