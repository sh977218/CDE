package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class StoreSearchTest extends NlmCdeBaseTest {
    
    @Test
    public void rememberText() {
        String cdeName = "Smoking History Ind";
        searchElt(cdeName, "cde");
        hangon(1);
        clickElement(By.id("linkToElt_0"));
        textPresent("CDE Summary");
        driver.navigate().back();
        textPresent(cdeName);
        Assert.assertTrue("Smoking History Ind".equals(findElement(By.id("linkToElt_0")).getText()));
    }
    
    @Test
    public void rememberPageNumber() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        scrollToTop();
        clickElement(By.cssSelector("button.mat-paginator-navigation-next"));
        textPresent("21 – 40");
        hangon(2);
        scrollToTop();
        clickElement(By.id("linkToElt_0"));
        textPresent("More like this");
        driver.navigate().back();
        textPresent("21 – 40");
    }

}
