package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
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
        clickElement(By.id("li-blank-Retired"));
        textPresent("All Topics | Retired");
        findElement(By.id("ftsearch-input")).sendKeys("Height");
        clickElement(By.id("li-blank-Retired"));
        textPresent("Height or length alternative measurement");
        driver.get(driver.getCurrentUrl());
        textNotPresent("Retired (");
        textPresent("Height or length alternative measurement");

    }


}
