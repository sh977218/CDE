package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class BoardViewTest extends BoardTest {

    @Test
    public void showLargeGridView() {
        mustBeLoggedInAs(ninds_username, password);
        goToBoard("Large Board");
        textPresent("Neuritic plaque");
        findElement(By.id("gridView")).click();
        textPresent("NeurtcPlaqBrnRegnScoreAnatcSit");
        textPresent("EEGInterictEpilpNLocOnsDescTxt");
        findElement(By.id("accordionView")).click();
        textPresent("Imaging contrast agent dose");
        textNotPresent("NeurtcPlaqBrnRegnScoreAnatcSit");
        textNotPresent("EEGInterictEpilpNLocOnsDescTxt");
        findElement(By.id("gridView")).click();
        findElement(By.linkText("Next")).click();
        textNotPresent("Imaging contrast agent dose");
        textPresent("Risk Factor Questionnaire (RFQ-U) - work rotenone product use 46 55 age indicator");
        textPresent("RFQWrkRotenoneProdUs4655AgeInd");
        textPresent("NMSSSeeThngNotThereSevScore");
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
        waitAndClick(By.id("gridView"));
        textPresent("Fluorescence in situ");
        textPresent("Anaplastic Lymp");
        textPresent("ALK Standard Deviation");
        textPresent("Pathologic N Stage");
        textPresent("pN0");
        textPresent("3436564");
        textPresent("3028594");
        textPresent("Prior BMSCT Administered Indicator");
        textPresent("Generalized Activities of Daily Living Pain");
        textPresent("Platinum free");
        textPresent("3535434");
    }

    public void attachToBoard(String cdeName, String boardName) {
        searchElt(cdeName, "cde", null);
        findElement(By.id("pinToBoard_0")).click();
        hangon(1);
        findElement(By.linkText(boardName)).click();
    }
}
