package gov.nih.nlm.quickBoard.cde;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeMoreElementsNoSideBySideCompareTest extends NlmCdeBaseTest {
    @Test
    public void cdeMoreElementsNoSideBySideCompare() {
        String cdeName1 = "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value";
        String cdeName2 = "Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count";
        String cdeName3 = "Prior BMSCT Administered Indicator";
        addCdeToQuickBoard(cdeName1);
        addCdeToQuickBoard(cdeName2);
        addCdeToQuickBoard(cdeName3);
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (3)");
        goToQuickBoardByModule("cde", true);
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_elt_compare_2"));
        clickElement(By.id("qb_compare"));
        textPresent("Please select only two elements to compare.");
        clickElement(By.id("qb_de_empty"));
        textPresent("CDE QuickBoard (0)");
    }
}
