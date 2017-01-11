package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class StoreSearchTest extends NlmCdeBaseTest {
    
    @Test
    public void rememberText() {
        String cdeName = "Smoking History Ind";
        goToCdeByName(cdeName);
        driver.navigate().back();
        textPresent(cdeName);
        Assert.assertTrue("Smoking History Ind".equals(findElement(By.id("linkToElt_0")).getText()));
    }
    
    @Test
    public void rememberPageNumber() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        scrollToTop();
        clickElement(By.linkText("2"));
        hangon(2);
        scrollToTop();
        clickElement(By.id("linkToElt_0"));

        textPresent("More Like This");
        driver.navigate().back();
        Assert.assertTrue(findElement(By.xpath("//li[a = '2']")).getAttribute("ng-class").contains("active"));
    }

}
