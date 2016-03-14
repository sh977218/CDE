package gov.nih.nlm.cde.test.quickboard;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeQuickBoardTest1 extends NlmCdeBaseTest {

    @Test
    public void cdeMoreElementsNoSideBySideCompare() {
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        addCdeToQuickBoard("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count");
        addCdeToQuickBoard("Prior BMSCT Administered Indicator");
        textPresent("Quick Board (3)");
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_elt_compare_2"));
        clickElement(By.id("qb_cde_compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb_cde_empty"));
        textPresent("CDE QuickBoard (0)");
    }

    @Test
    public void cdeLessElementsNoSideBySideCompare() {
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        addCdeToQuickBoard("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count");
        addCdeToQuickBoard("Prior BMSCT Administered Indicator");
        textPresent("Quick Board (3)");
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_cde_compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb_cde_empty"));
        textPresent("CDE QuickBoard (0)");
    }

    @Test
    public void doubleElementedQuickboard(){
        addCdeToQuickBoard("In the past 7 days how much did pain interfere with work around the home?");
        addCdeToQuickBoard("During the past 4 weeks, how much have you been bothered by headaches?");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_cde_compare"));
        textPresent("During the past 4 weeks, how much have you been bothered by headaches?");
        textPresent("how much did pain interfere with work around the home?");
    }

}
