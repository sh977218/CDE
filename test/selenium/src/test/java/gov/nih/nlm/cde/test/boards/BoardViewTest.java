package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardViewTest extends BoardTest {

    @Test
    public void showLargeGridView() {
        mustBeLoggedInAs(ninds_username, password);
        goToBoard("Large Board");
        findElement(By.id("gridView")).click();
        textPresent("TissSpecmnCollctnDateTime");
        textPresent("DrgSubIllctUseOTH");
        findElement(By.id("accordionView")).click();
        textPresent("Tissue specimen collection date and time");
        textNotPresent("TissSpecmnCollctnDateTime");
        textNotPresent("DrgSubIllctUseOTH");
        findElement(By.linkText("Next")).click();
        textNotPresent("Tissue specimen collection date and time");
        textPresent("Sex participant or subject genotype type");
        textPresent("MS diagnostic criterion type");
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
        findElement(By.id("gridView")).click();
        textPresent("Fluorescence in situ");
        textPresent("Anaplastic Lymp");
        textPresent("ALK Standard Deviation");
        textPresent("Pathologic N Stage");
        textPresent("Prostate Cancer pN0 TNM Finding");
        textPresent("3436564");
        textPresent("3028594");
        textPresent("Prior BMSCT Administered Indicator");
        textPresent("Generalized Activities of Daily Living Pain");
        textPresent("Platinum free");
        textPresent("3535434");
    }

    public void attachToBoard(String cdeName, String boardName) {
        openCdeInList(cdeName);
        findElement(By.xpath("//a[@id='pin_0']")).click();
        hangon(1);
        findElement(By.linkText(boardName)).click();
    }
}
