package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class AStandardStatusTest extends NlmCdeBaseTest {
    
    @Test
    public void nlmPromotesToStandard() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Patient Name");
        Assert.assertTrue(textPresent("Qualified"));
        findElement(By.id("editStatus")).click();
        modalHere();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Standard");
        Assert.assertTrue(textPresent("Standard CDEs cannot be edited by their stewards"));
        modalHere();
        findElement(By.id("saveRegStatus")).click();
        closeAlert();
        goToCdeByName("Patient Name");
        Assert.assertTrue(textPresent("Standard"));
    }
    
    
    @DataProvider(name = "standardAndPreferredStandardCde")
    public Object[][] standardAndPreferredStandardCdeArray() {
        return new Object[][] {
            { "Patient Visual Change", "Standard" },
            { "Patient Visual Change", "Preferred Standard" },
        };
    }
    
    @Test(dataProvider = "standardAndPreferredStandardCde")
    public void adminCantEditStandardCde(String cdeName, String regStatus) {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        findElement(By.id("editStatus")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText(regStatus);
        modalHere();
        findElement(By.id("saveRegStatus")).click();
        closeAlert();
        hangon(1);
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
        
        // Can't edit Concepts
        findElement(By.linkText("Concepts")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("ocConceptRemove-0")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("propConceptRemove-0")));

        // Can add Attachments
        findElement(By.linkText("Attachments")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("i.fa-upload")));
    }
    
    
}
