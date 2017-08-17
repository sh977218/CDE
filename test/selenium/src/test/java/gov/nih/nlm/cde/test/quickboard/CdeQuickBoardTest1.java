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
        clickElement(By.id("qb_compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb_de_empty"));
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
        clickElement(By.id("qb_compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb_de_empty"));
        textPresent("CDE QuickBoard (0)");
    }

//    @Test
    public void doubleElementedQuickboard(){
        addCdeToQuickBoard("Spinal cord injury upper extremity shoulder function status");
        addCdeToQuickBoard("Right upper extremity upper motor neuron clinical indicator");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_compare"));
        textPresent("The status of shoulder function as part of the test in spinal cord injury.");
        textPresent("Indicator of whether the examination found clinical evidence of upper motor neuron (UMN) dysfunction in the right upper extremity (RUE) region.");
    }

}
