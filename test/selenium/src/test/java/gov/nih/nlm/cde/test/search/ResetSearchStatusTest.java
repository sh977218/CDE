package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class ResetSearchStatusTest extends NlmCdeBaseTest {
    @Test
    public void resetSearchStatus() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Administration, Management Performed Study Activity Variance Reason ISO21090.ST.v1.0");
        findElement(By.id("editStatus")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Preferred Standard");
        findElement(By.id("saveRegStatus")).click();
        Assert.assertTrue(textPresent("Saved"));
        modalGone();
        logout();

        goToCdeSearch();
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertTrue(textPresent("10"));
        Assert.assertTrue(linkList.size() > 10);
        findElement(By.id("li-checked-Standard")).click();
        hangon(1);
        findElement(By.id("li-checked-Qualified")).click();
        hangon(2);
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        // Expectation, less than 10 standard CDEs when this test runs.
        Assert.assertTrue(linkList.size() < 10);
        scrollToTop();
        findElement(By.id("resetSearch")).click();
        findElement(By.id("li-checked-Standard"));
        Assert.assertTrue(textPresent("PBTC ("));
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertTrue(linkList.size() > 10);
    }
}
