package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SaveSearchState extends NlmCdeBaseTest {

    @Test
    public void saveSearchState() {
        mustBeLoggedOut();
        setLowStatusesVisible();
        goToCdeSearch();
        clickElement(By.id("browseOrg-CTEP"));
        textPresent("results for All Terms");
        int numRes = getNumberOfResults();
        clickElement(By.id("li-blank-CATEGORY"));
        textNotPresent(numRes + " results for");
        numRes = getNumberOfResults();
        clickElement(By.id("li-blank-Standard"));
        textNotPresent(numRes + " results for");
        clickElement(By.id("li-blank-Qualified"));
        scrollToTop();
        checkSearchResultInfo("All Terms", "CTEP > CATEGORY", null, "All Topics", "Standard, Qualified", null);
        clickElement(By.id("li-checked-Qualified"));
        scrollToTop();
        checkSearchResultInfo("All Terms", "CTEP > CATEGORY", null, "All Topics", "Standard", null);
        findElement(By.name("q")).sendKeys("name");
        clickElement(By.id("search.submit"));
        checkSearchResultInfo("name", "CTEP", null, "All Topics", "All Statuses", null);
        clickElement(By.linkText("Forms"));
        hangon(1);
        textNotPresent("CATEGORY");
        driver.navigate().back();
        checkSearchResultInfo("name", "CTEP", null, "All Topics", "All Statuses", null);
    }
}
