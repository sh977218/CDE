package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class CdeStandardStatusTest extends NlmCdeBaseTest {
       
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
        
        loginAs(cabigAdmin_username, password);
        goToCdeByName(cdeName);
        // CDE is Standard.
        // Can't edit name, def or status
        Assert.assertEquals(driver.findElements(By.xpath("//dd[@id='dd_general_name']//i[@class='fa fa-edit']")).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath("//dd[@id='dd_def']//i[@class='fa fa-edit']")).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath("//dd[@id='dd_uom']//i[@class='fa fa-edit']")).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath("//dd[@id='dd_status']//i[@class='fa fa-edit']")).size(), 0);

        // Can't edit Value Type or add / remove pv
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertFalse(driver.findElements(By.xpath("//i[@id='editDatatype']")).get(0).isDisplayed());
        Assert.assertFalse(driver.findElements(By.id("pvRemove-1")).get(0).isDisplayed());
        Assert.assertFalse(driver.findElements(By.id("pvUp-1")).get(0).isDisplayed());
        Assert.assertFalse(driver.findElements(By.id("pvDown-1")).get(0).isDisplayed());
        Assert.assertFalse(driver.findElements(By.xpath("//td[@id='pv-1']//i[contains(@class, 'fa-edit')]")).get(0).isDisplayed());
        Assert.assertFalse(driver.findElements(By.id("addPv")).get(0).isDisplayed());
        Assert.assertFalse(driver.findElements(By.id("updateOID")).get(0).isDisplayed());

        // Can't edit naming
        findElement(By.linkText("Naming")).click();
        Assert.assertFalse(driver.findElements(By.xpath("//dd[@id='dd_name_0']//i[contains(@class, 'fa-edit')]")).get(0).isDisplayed());
        Assert.assertFalse(driver.findElements(By.xpath("//dd[@id='dd_def_0']//i[contains(@class, 'fa-edit')]")).get(0).isDisplayed());
        Assert.assertFalse(driver.findElements(By.xpath("//dd[@id='dd_context_0']//i[contains(@class, 'fa-edit')]")).get(0).isDisplayed());

        // Can edit classifications
        findElement(By.linkText("Classification")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("addClassification")));
        
        // Can't edit Concepts
        findElement(By.linkText("Concepts")).click();
        Assert.assertFalse(driver.findElements(By.id("ocConceptRemove-0")).get(0).isDisplayed());
        Assert.assertFalse(driver.findElements(By.id("propConceptRemove-0")).get(0).isDisplayed());

        // Can add Attachments
        findElement(By.linkText("Attachments")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("i.fa-upload")));
    }
    
    
}
