package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
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
        textPresent("Saved");
        modalGone();
        logout();

        goToCdeSearch();
        setLowStatusesVisible();
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        textPresent("10");
        findElement(By.id("li-blank-Candidate")).click();
        hangon(2);
        findElement(By.id("li-blank-Recorded")).click();
        hangon(2);
        findElement(By.id("li-blank-Incomplete")).click();
        hangon(2);
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        // Expectation, less than 10 standard CDEs when this test runs.
        Assert.assertTrue(linkList.size() > 10);
        scrollToTop();
        findElement(By.id("resetSearch")).click();
        Assert.assertTrue(textPresent("PBTC ("));
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertTrue(linkList.size() > 10);
    }
}