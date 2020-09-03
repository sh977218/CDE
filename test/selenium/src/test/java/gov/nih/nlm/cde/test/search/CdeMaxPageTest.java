package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeMaxPageTest extends NlmCdeBaseTest {
    @Test
    public void cdeMaxPage() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        clickElement(By.id("search_by_classification_NHLBI"));
        int result = getNumberOfResults();
        textPresent(result + " data element results for");
        findElement(By.xpath("//*[@id='goToPage']//input")).clear();
        hangon(1);
        findElement(By.xpath("//*[@id='goToPage']//input")).sendKeys("5");
        checkAlert("Invalid page: 5");
    }
}