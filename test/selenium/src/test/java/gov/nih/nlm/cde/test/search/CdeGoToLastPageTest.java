package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeGoToLastPageTest extends NlmCdeBaseTest {
    @Test
    public void cdeGoToLastPage() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        clickElement(By.id("search_by_classification_NHLBI"));
        textPresent("29 results for");
        findElement(By.xpath("//*[@id='goToPage']//input")).clear();
        hangon(1);
        findElement(By.xpath("//*[@id='goToPage']//input")).sendKeys("2");
        textPresent("21 - 29 of 29");
    }
}