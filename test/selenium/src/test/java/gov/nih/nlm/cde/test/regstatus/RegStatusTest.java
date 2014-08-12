package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class RegStatusTest extends NlmCdeBaseTest {

    // TODO - Cannot get this test to pass. Can't figure out why.
//    @Test
    public void administrativeStatus() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Small Cell Lung Carcinoma Invasion Status");
        findElement(By.linkText("Status")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("dd_adminStatus")));
        findElement(By.linkText("General Details")).click();
        findElement(By.id("editStatus")).click();
        findElement(By.name("administrativeStatus")).sendKeys("Ready For Review");
        findElement(By.id("saveRegStatus")).click();
        hangon(2);
        goToCdeByName("Small Cell Lung Carcinoma Invasion Status");
        findElement(By.linkText("Status")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("dd_adminStatus")));
        Assert.assertTrue(textPresent("Ready For Review"));
        findElement(By.linkText("General Details")).click();
        findElement(By.id("editStatus")).click();
        findElement(By.name("administrativeStatus")).clear();
        findElement(By.name("administrativeStatus")).sendKeys(Keys.BACK_SPACE);
        findElement(By.id("saveRegStatus")).click();
        hangon(2);
        goToCdeByName("Small Cell Lung Carcinoma Invasion Status");
        findElement(By.linkText("Status")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("dd_adminStatus")));        
        logout();
    }
    
    @Test
    public void changeRegistrationStatus() {
        mustBeLoggedInAs(cabigAdmin_username, cabigAdmin_password);
        goToCdeByName("Investigator Identifier java.lang.Integer");
        Assert.assertTrue(textPresent("Qualified"));
        findElement(By.id("editStatus")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Recorded");
        Assert.assertTrue(textPresent("Recorded CDEs are visible to the public"));
        findElement(By.name("effectiveDate")).sendKeys("9/15/2013");
        findElement(By.name("untilDate")).sendKeys("10/31/2014");
        findElement(By.name("administrativeNote")).sendKeys("Admin Note 1");
        findElement(By.name("unresolvedIssue")).sendKeys("Unresolved Issue 1");
        findElement(By.id("saveRegStatus")).click();
        closeAlert();
        goToCdeByName("Investigator Identifier java.lang.Integer");
        Assert.assertTrue(textPresent("Recorded"));
        findElement(By.linkText("Status")).click();
        Assert.assertTrue(textPresent("Recorded"));
        Assert.assertTrue(textPresent("09/15/2013"));
        Assert.assertTrue(textPresent("10/31/2014"));
        Assert.assertTrue(textPresent("Admin Note 1"));
        Assert.assertTrue(textPresent("Unresolved Issue 1"));
    }
        
    @Test
    public void retire() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        String cdeName = "Laboratory Procedure Alkaline Phosphatase Result Date";
        goToCdeByName(cdeName);
        Assert.assertTrue(textPresent("Qualified"));        
        findElement(By.id("editStatus")).click();
        modalHere();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Retired");
        Assert.assertTrue(textPresent("Retired Data Elements are not returned in searches"));
        findElement(By.id("saveRegStatus")).click();
        closeAlert();
        goToSearch();
        findElement(By.name("ftsearch")).sendKeys("Alkaline");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains(cdeName));
    }
    
    @Test
    public void removeStatusStatusFilter() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToSearch();
        findElement(By.id("li-blank-PBTC")).click();
        Assert.assertTrue(textPresent("4 results for"));
        String viewing = findElement(By.id("acc_link_0")).getText();
        findElement(By.xpath("//span[@id='acc_link_0']/../i[@title='View']")).click();
        Assert.assertTrue(textPresent("More Like This"));
        Assert.assertTrue(textPresent(viewing));
        findElement(By.xpath("//i[@id='editStatus']")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Preferred Standard");
        modalHere();
        findElement(By.id("saveRegStatus")).click();
        closeAlert();
        hangon(3);
        findElement(By.linkText("CDEs")).click();
        hangon(1);
        findElement(By.id("li-blank-Preferred Standard")).click();
        Assert.assertTrue(textPresent("1 results for"));
        findElement(By.xpath("//i[@title='View']")).click();
        hangon(0.5);
        findElement(By.xpath("//i[@id='editStatus']")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Standard");
        modalHere();
        findElement(By.id("saveRegStatus")).click();
        closeAlert();
        hangon(1);
        goToSearchByMenu();
        hangon(1);
        Assert.assertTrue(textPresent("4 results for"));
        Assert.assertTrue(textNotPresent("Preferred Standard"));
    }
    
}
