package gov.nih.nlm.board;

import gov.nih.nlm.board.cde.BoardTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ShowLargeGridViewTest extends BoardTest {
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

}
