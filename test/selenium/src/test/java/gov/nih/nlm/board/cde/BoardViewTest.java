package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;

public class BoardViewTest extends BoardTest {

    @Test
    public void showLargeGridView() {
        mustBeLoggedInAs(ninds_username, password);
        goToBoard("Large Board");
        textPresent("Ventilator assistance utilization indicator");
        Assert.assertEquals(driver.getTitle(), "Board: Large Board");
        clickElement(By.id("list_gridView"));
        textPresent("VentilatorAssistanceUtilznInd");
        textPresent("HMQMstFreqHlthProfCareTyp");
        clickElement(By.id("list_summaryView"));
        textPresent("Rome III Constipation Module (RCM3) - abdomen discomfort relieve bowel movement frequency");
        textNotPresent("VentilatorAssistanceUtilznInd");
        textNotPresent("HMQMstFreqHlthProfCareTyp");
        clickElement(By.id("list_gridView"));
        clickElement(By.cssSelector(".mat-paginator-navigation-next"));
        textNotPresent("Ventilator assistance utilization indicator");
        textPresent("Surgery radiosurgery lobe location text");
        textPresent("BRCDifficltFallAslpNghtInd");
        textPresent("PulmFuncSNIPPeakPressrVal");
    }

    @Test
    public void showGridView() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Test Board";

        pinCdeToBoardWithModal("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage", boardName);
        pinCdeToBoardWithModal("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value", boardName);
        pinCdeToBoardWithModal("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count", boardName);
        pinCdeToBoardWithModal("Prior BMSCT Administered Indicator", boardName);
        pinCdeToBoardWithModal("Generalized Activities of Daily Living Pain Restricted Scale", boardName);
        closeAlert();
        hangon(1);
        goToBoard(boardName);
        textPresent("CODE_FOR");

        clickElement(By.id("list_gridView"));

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

    @Test
    public void pageTooFar() {
        get(baseUrl + "/server/board/abc/0/1000").then().statusCode(400);
    }

}
