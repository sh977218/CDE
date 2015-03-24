
package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PvTest extends NlmCdeBaseTest {

    @Test
    public void changePermissibleValue() {
        String cdeName = "Additional Pathologic Findings Chronic Proctocolitis Indicator";
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click(); 
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//td[@id='pv-0']/div/span/span[1]/i")));
        findElement(By.cssSelector("#pv-0 .fa-edit")).click();
        findElement(By.cssSelector("#pv-0 input")).sendKeys(" added to pv");
        findElement(By.cssSelector("#pv-0 .fa-check")).click();
        newCdeVersion("Changed PV");

        Assert.assertTrue(textPresent("added to pv"));
        
        checkInHistory("Permissible Values", "Indeterminate", "Indeterminate added to pv");
        
    }    
    
    @Test
    public void longPvList() {
        goToCdeByName("Common Toxicity Criteria Adverse Event Short Name Type");
        findElement(By.linkText("Permissible Values")).click();         
        Assert.assertTrue(textPresent("Hemoglobinuria"));
        Assert.assertTrue(textNotPresent("Hypermagnesemia"));
        findElement(By.id("showMorePvs")).click();
        Assert.assertTrue(textPresent("Hypermagnesemia"));
    }
    
    @Test
    public void hideProprietaryPv() {
        mustBeLoggedInAs(ninds_username, password);        
        goToCdeByName("Post traumatic amnesia duration range");
        findElement(By.linkText("Permissible Values")).click();         
        findElement(By.cssSelector("#pvCodeSystem-0 .fa-edit")).click();
        findElement(By.xpath("//td[@id='pvCodeSystem-0']//input")).sendKeys("SNOMEDCT");
        findElement(By.cssSelector("#pvCodeSystem-0 .fa-check")).click();
        newCdeVersion();
        
        mustBeLoggedInAs(ninds_username, password); 
        goToCdeByName("Post traumatic amnesia duration range");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("SNOMEDCT"));
       
        logout();
        goToCdeByName("Post traumatic amnesia duration range");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textNotPresent("SNOMEDCT"));
        Assert.assertTrue(textPresent("Login to see the value."));        
    }    

    
}
