package gov.nih.nlm.cde.test.quickboard;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class CompareThreeThenTwoElementsTest extends NlmCdeBaseTest {

    @Test
    public void compareThreeThenTwoElements() {
        String cde1 = "Assessment of Motor and Process Skills Assessment Complete Indicator";
        String cde2 = "EuroQOL Complete Indicator";
        String cde3 = "Administration Route of Administration java.lang.String";
        addCdeToQuickBoard(cde1);
        addCdeToQuickBoard(cde2);
        addCdeToQuickBoard(cde3);
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_elt_compare_2"));
        clickElement(By.id("qb_compare"));
        checkAlert("Please select only two elements to compare.");
        clickElement(By.id("remove_2"));
        clickElement(By.id("qb_compare"));
        textPresent("Text term to signify a completed assessment using the Assessment of Motor and Process Skills Assessment (AMPS)");
        textPresent("the indicator whether the EuroQOL (EQ-5D), a descriptive questionnaire that consists of 5");
    }

}
