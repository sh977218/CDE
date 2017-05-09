package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class BoardViewTest extends BoardTest {

    @Test
    public void showLargeGridView() {
        mustBeLoggedInAs(ninds_username, password);
        goToBoard("Large Board");
        textPresent("Ventilator assistance utilization indicator");
        clickElement(By.id("cde_gridView"));
        textPresent("VentilatorAssistanceUtilznInd");
        textPresent("HMQMstFreqHlthProfCareTyp");
        clickElement(By.id("cde_summaryView"));
        textPresent("Rome III Constipation Module (RCM3) - abdomen discomfort relieve bowel movement frequency");
        textNotPresent("VentilatorAssistanceUtilznInd");
        textNotPresent("HMQMstFreqHlthProfCareTyp");
        clickElement(By.id("cde_gridView"));
        clickElement(By.linkText("Next"));
        textNotPresent("Ventilator assistance utilization indicator");
        textPresent("Surgery radiosurgery lobe location text");
        textPresent("BRCDifficltFallAslpNghtInd");
        textPresent("PulmFuncSNIPPeakPressrVal");
    }

    @Test
    public void showGridView() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Test Board";

        attachToBoard("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage", boardName);
        attachToBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value", boardName);
        attachToBoard("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count", boardName);
        attachToBoard("Prior BMSCT Administered Indicator", boardName);
        attachToBoard("Generalized Activities of Daily Living Pain Restricted Scale", boardName);
        closeAlert();
        hangon(1);
        goToBoard(boardName);
        textPresent("CODE_FOR");

        clickElement(By.id("cde_gridView"));

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

    private void attachToBoard(String cdeName, String boardName) {
        searchElt(cdeName, "cde");
        findElement(By.id("pinToBoard_0")).click();
        findElement(By.linkText(boardName)).click();
        textPresent("Added to Board");
    }
}
