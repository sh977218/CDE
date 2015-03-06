package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardViewTest extends BoardTest {

    @Test
    public void showLargeGridView() {
        mustBeLoggedInAs(ninds_username, password);
        goToBoard("Large Board");
        findElement(By.linkText("Grid View")).click();
        textPresent("500 documents returned");
        Assert.assertTrue(driver.findElements(By.cssSelector("div.ngRow")).size() > 20);
    }
    
    @Test
    public void showGridView() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Test Board";
        createBoard(boardName, "Test");

        attachToBoard("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage", boardName);        
        attachToBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value", boardName);
        attachToBoard("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count", boardName);
        attachToBoard("Prior BMSCT Administered Indicator", boardName);
        attachToBoard("Generalized Activities of Daily Living Pain Restricted Scale", boardName);
        closeAlert();
        hangon(1);
        goToBoard(boardName);
        findElement(By.linkText("Grid View")).click();
        Assert.assertEquals(driver.findElements(By.cssSelector("div.ngRow")).size(), 5);
        textPresent("Fluorescence in situ");
        textPresent("pN0, pN1, NX");
        textPresent("ALK Standard");
        textPresent("Indicator of Yes or No");
        textPresent("CTEP");
    }

    public void attachToBoard(String cdeName, String boardName) {
        openCdeInList(cdeName);
        findElement(By.xpath("//a[@id='pin_0']")).click();
        hangon(1);
        findElement(By.linkText(boardName)).click();
    }
}
