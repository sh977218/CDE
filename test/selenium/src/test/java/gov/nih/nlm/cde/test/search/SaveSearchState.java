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
        findElement(By.id("browseOrg-CTEP")).click();
        textPresent("results for All Terms");
        int numRes = getNumberOfResults();
        clickElement(By.id("li-blank-CATEGORY"));
        textNotPresent(numRes + " results for");
        numRes = getNumberOfResults();
        clickElement(By.id("li-blank-Standard"));
        textNotPresent(numRes + " results for");
        clickElement(By.id("li-blank-Qualified"));
        scrollToTop();
        textPresent("results for All Terms | CTEP > CATEGORY | All Topics | Standard, Qualified");
        clickElement(By.id("li-checked-Qualified"));
        scrollToTop();
        textPresent("results for All Terms | CTEP > CATEGORY | All Topics | Standard");
        findElement(By.name("q")).sendKeys("name");
        findElement(By.id("search.submit")).click();
        textPresent("results for name | CTEP | All Topics | All Statuses");
        findElement(By.linkText("Forms")).click();
        hangon(1);
        textNotPresent("CATEGORY");
        driver.navigate().back();
        textPresent("results for name | CTEP | All Topics | All Statuses");
    }
}
