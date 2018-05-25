package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeEmptySearchResultOrderTest extends NlmCdeBaseTest {

    @Test
    public void cdeEmptySearchResultOrder() {
        setLowStatusesVisible();
        goToCdeSearch();
        clickElement(By.id("search_by_classification_GRDR"));
        textPresent("Qualified", By.id("registrationStatus_0"));
        textPresent("Recorded", By.id("registrationStatus_1"));
    }

}