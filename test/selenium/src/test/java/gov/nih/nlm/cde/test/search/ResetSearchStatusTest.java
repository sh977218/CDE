package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ResetSearchStatusTest extends NlmCdeBaseTest {
    @Test
    public void resetSearchStatus() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-caBIG"));
        clickElement(By.id("menu_cdes_link"));
        isSearchWelcome();
    }
}
