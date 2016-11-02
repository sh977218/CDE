package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class CompareTest extends NlmCdeBaseTest {

    @Test
    public void noElementCompareList() {
        mustBeLoggedOut();
        goToCdeSearch();
        clickElement(By.linkText("Quick Board (0)"));
        textPresent("The quick board is empty.");
    }

    @Test
    public void compare2Elements() {
        emptyQuickBoardByModule("cde");
        addToCompare("Person Gender Text Type", "Patient Gender Category");
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-0-valid")));
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-3-warning")));
        textNotPresent("VSAC Value Set");
    }

    @Test
    public void compare3Then2Elements() {
        String cde1 = "Assessment of Motor and Process Skills Assessment Complete Indicator";
        String cde2 = "EuroQOL Complete Indicator";
        String cde3 = "Administration Route of Administration java.lang.String";

        addCdeToQuickBoard(cde1);
        addCdeToQuickBoard(cde2);
        addCdeToQuickBoard(cde3);
        clickElement(By.linkText("Quick Board (3)"));
        clickElement(By.xpath("//*[@id=\"qb_cde_tab\"]/a"));
        textPresent(cde1);
        textPresent(cde2);
        textPresent(cde3);
        findElement(By.id("qb_cde_compare")).click();
        textPresent("You may only compare 2 elements side by side.");
        closeAlert();
        findElement(By.id("remove_2")).click();
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
