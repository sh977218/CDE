package gov.nih.nlm.cde.common.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

public abstract class RegStatusTest extends CommonTest {
 
    public void changeRegistrationStatus(String eltName, String user) {
        mustBeLoggedInAs(user, password);
        goToEltByName(eltName);
        textPresent("Qualified");
        findElement(By.id("editStatus")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Recorded");
        textPresent("Recorded elements are visible to the public");
        findElement(By.name("effectiveDate")).sendKeys("9/15/2013");
        findElement(By.name("untilDate")).sendKeys("10/31/2014");
        findElement(By.name("administrativeNote")).sendKeys("Admin Note 1");
        findElement(By.name("unresolvedIssue")).sendKeys("Unresolved Issue 1");
        findElement(By.id("saveRegStatus")).click();
        closeAlert();
        goToEltByName(eltName);
        textPresent("Recorded");
        findElement(By.linkText("Status")).click();
        textPresent("Recorded");
        textPresent("09/15/2013");
        textPresent("10/31/2014");
        textPresent("Admin Note 1");
        textPresent("Unresolved Issue 1");
    }
        
    public void retire(String eltName, String user) {
        mustBeLoggedInAs(user, password);
        goToEltByName(eltName);
        Assert.assertTrue(textPresent("Qualified"));        
        findElement(By.id("editStatus")).click();
        modalHere();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Retired");
        Assert.assertTrue(textPresent("Retired elements are not returned in searches"));
        findElement(By.id("saveRegStatus")).click();
        closeAlert();
        goToEltSearch();
        findElement(By.name("ftsearch")).sendKeys("Alkaline");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains(eltName));
    }

    public void nlmPromotesToStandard(String eltName) {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToEltByName(eltName);
        textPresent("Qualified");
        findElement(By.id("editStatus")).click();
        modalHere();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Standard");
        textPresent("Standard elements cannot be edited by their stewards");
        modalHere();
        findElement(By.id("saveRegStatus")).click();
        closeAlert();
        goToEltByName(eltName);
        Assert.assertTrue(textPresent("Standard"));
    }
    
    
}