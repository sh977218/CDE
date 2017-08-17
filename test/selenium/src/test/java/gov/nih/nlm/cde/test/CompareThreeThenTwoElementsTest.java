package gov.nih.nlm.cde.test;

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
        clickElement(By.linkText("Quick Board (3)"));
        clickElement(By.id("dataElementQuickBoard"));
        textPresent(cde1);
        textPresent(cde2);
        textPresent(cde3);
        clickElement(By.id("qb_cde_compare"));
        textPresent("You may only compare 2 elements side by side.");
        closeAlert();
        clickElement(By.id("remove_2"));
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_cde_compare"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-0-warning")));
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-3-valid")));
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-6-valid")));
        textPresent("an observational assessment that is used to measure");
        textPresent("pain/discomfort, and anxiety/depression");
    }

}
