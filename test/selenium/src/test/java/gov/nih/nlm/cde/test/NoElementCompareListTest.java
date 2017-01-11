package gov.nih.nlm.cde.test;


import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NoElementCompareListTest extends NlmCdeBaseTest {
    @Test
    public void noElementCompareList() {
        mustBeLoggedOut();
        goToCdeSearch();
        clickElement(By.linkText("Quick Board (0)"));
        textPresent("The quick board is empty.");
    }
}