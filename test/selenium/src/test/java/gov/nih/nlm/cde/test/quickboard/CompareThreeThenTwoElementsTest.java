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
        textPresent("Please select only two elements to compare.");
        closeAlert();
        clickElement(By.id("remove_2"));
        clickElement(By.id("qb_compare"));
        textPresent("an observational assessment that is used to measure");
        textPresent("pain/discomfort, and anxiety/depression");
    }

}
