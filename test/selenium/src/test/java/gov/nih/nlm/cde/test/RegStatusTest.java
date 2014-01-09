package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class RegStatusTest extends NlmCdeBaseTest {
    
    @Test
    public void changeRegistrationStatus() {
        loginAs(cabigAdmin_username, cabigAdmin_password);
        goToCdeByName("Investigator Identifier java.lang.Integer");
        Assert.assertTrue(textPresent("Qualified"));
        findElement(By.id("editStatus")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Recorded");
        findElement(By.name("effectiveDate")).sendKeys("9/15/2013");
        findElement(By.name("untilDate")).sendKeys("10/31/2014");
        findElement(By.name("administrativeNote")).sendKeys("Admin Note 1");
        findElement(By.name("unresolvedIssue")).sendKeys("Unresolved Issue 1");
        findElement(By.id("saveRegStatus")).click();
        modalGone();
        goToCdeByName("Investigator Identifier java.lang.Integer");
        Assert.assertTrue(textPresent("Recorded"));
        findElement(By.linkText("Status")).click();
        Assert.assertTrue(textPresent("Recorded"));
        Assert.assertTrue(textPresent("09/15/2013"));
        Assert.assertTrue(textPresent("10/31/2014"));
        Assert.assertTrue(textPresent("Admin Note 1"));
        Assert.assertTrue(textPresent("Unresolved Issue 1"));
        logout();
    }
        
    @Test
    public void nlmPromotesToStandard() {
        loginAs(nlm_username, nlm_password);
        goToCdeByName("Patient Name");
        Assert.assertTrue(textPresent("Qualified"));
        findElement(By.id("editStatus")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Standard");
        findElement(By.id("saveRegStatus")).click();
        modalGone();
        goToCdeByName("Patient Name");
        Assert.assertTrue(textPresent("Standard"));
        logout();
    }
    
    @Test
    public void retire() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Colitis Grade");
        Assert.assertTrue(textPresent("Qualified"));
        findElement(By.id("editStatus")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Retired");
        findElement(By.id("saveRegStatus")).click();
        modalGone();
        driver.get(baseUrl + "/");
        findElement(By.name("ftsearch")).sendKeys("Colitis");
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Common Toxicity Criteria Adverse Event Colitis Grade") < 0);
        logout();
    }
    
}
