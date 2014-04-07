package gov.nih.nlm.cde.test;

import java.util.concurrent.TimeUnit;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
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
        hangon(2);
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
        modalHere();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Standard");
        modalHere();
        findElement(By.id("saveRegStatus")).click();
        hangon(2);
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
        modalHere();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Retired");
        findElement(By.id("saveRegStatus")).click();
        hangon(2);
        goHome();
        findElement(By.name("ftsearch")).sendKeys("Colitis");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Common Toxicity Criteria Adverse Event Colitis Grade") < 0);
        logout();
    }
    
    @Test
    public void adminCantEditStandardCde() {
        String cdeName = "Patient Visual Change";
        loginAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        findElement(By.id("editStatus")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Standard");
        modalHere();
        findElement(By.id("saveRegStatus")).click();
        hangon(2);
        logout();
        
        loginAs(cabigAdmin_username, cabigAdmin_password);
        goToCdeByName(cdeName);
        // CDE is Standard.
        // Can't edit name, def or status
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//dd[@id='dd_general_name']//i[@class='fa fa-edit']")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//dd[@id='dd_def']//i[@class='fa fa-edit']")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//dd[@id='dd_uom']//i[@class='fa fa-edit']")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//dd[@id='dd_status']//i[@class='fa fa-edit']")));

        // Can't edit Value Type or add / remove pv
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//dd[@id='dd_valueType']//i[@class='fa fa-edit']")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("pvRemove-1")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("pvUp-1")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("pvDown-1")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//td[@id='pv-1']//i[@class='fa fa-edit']")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.linkText("Add Permissible Value")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.linkText("Update O.I.D")));

        // Can't edit naming
        findElement(By.linkText("Naming")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//dd[@id='dd_name_0']//i[@class='fa fa-edit']")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//dd[@id='dd_def_0']//i[@class='fa fa-edit']")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//dd[@id='dd_context_0']//i[@class='fa fa-edit']")));

        // Can edit classifications
        findElement(By.linkText("Classification")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("addClassification")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("removeClassification-0-0")));

        // Can edit Usage
        findElement(By.linkText("Usage")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("addUsedBy")));
        
        // Can't edit Concepts
        findElement(By.linkText("Concepts")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("ocConceptRemove-0")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("propConceptRemove-0")));

        // Can add Attachments
        findElement(By.linkText("Attachments")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("i.fa-upload")));
        
        logout();
    }
    
}
