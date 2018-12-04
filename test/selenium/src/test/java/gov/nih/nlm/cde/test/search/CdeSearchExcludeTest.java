package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeSearchExcludeTest extends NlmCdeBaseTest {

    @Test
    public void searchOneExclude() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-TEST"));
        textPresent("LOINC");
        clickElement(By.id("excludeFilterModeToggle"));
        
    }

    @Test
    public void searchTwoExclude() {

    }

    @Test
    public void searchAllExclude() {

    }


}