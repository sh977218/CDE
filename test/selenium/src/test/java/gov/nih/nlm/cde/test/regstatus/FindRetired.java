package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class FindRetired extends NlmCdeBaseTest {

    @Test
    public void findRetired() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        textNotPresent("Retired (");
        clickElement(By.id("searchSettings"));
        clickElement(By.id("includeRetired"));
        clickElement(By.id("saveSettings"));
        textPresent("Retired (");
        clickElement(By.id("regstatus-Retired"));
        checkSearchResultInfo(null, null, null, "All Topics", "Retired", null);
        findElement(By.id("ftsearch-input")).sendKeys("Height");
        clickElement(By.id("search.submit"));
        clickElement(By.id("regstatus-Retired"));
        textPresent("Height or length alternative measurement");
        driver.get(driver.getCurrentUrl());
        textPresent("Retired", By.id("status_crumb"));
        textPresent("Height or length alternative measurement");
        textPresent("Retired (2");
    }


}
