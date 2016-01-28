
package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.system.NlmCdeBaseTest;
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
        clickElement(By.id("pvs_tab"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//td[@id='pv-0']/div/span/span[1]/i")));
        clickElement(By.cssSelector("#pv-0 .fa-edit"));
        findElement(By.cssSelector("#pv-0 input")).sendKeys(" added to pv");
        clickElement(By.cssSelector("#pv-0 .fa-check"));
        newCdeVersion("Changed PV");

        Assert.assertTrue(textPresent("added to pv"));

        showAllTabs();
        checkInHistory("Permissible Values", "Indeterminate", "Indeterminate added to pv");
        
    }    
    
    @Test
    public void longPvList() {
        goToCdeByName("Common Toxicity Criteria Adverse Event Short Name Type");
        clickElement(By.id("pvs_tab"));
        textPresent("Hemoglobinuria");
        textNotPresent("Hypermagnesemia");
        clickElement(By.id("showMorePvs"));
        textPresent("Hypermagnesemia");
    }
    
    @Test
    public void hideProprietaryPv() {
        mustBeLoggedInAs(ninds_username, password);        
        goToCdeByName("Post traumatic amnesia duration range");
        clickElement(By.id("pvs_tab"));
        clickElement(By.cssSelector("#pvCodeSystem-0 .fa-edit"));
        findElement(By.xpath("//td[@id='pvCodeSystem-0']//input")).sendKeys("SNOMEDCT");

        hangon(1);
        if (driver.findElements(By.cssSelector("#pvCodeSystem-0 a")).size() > 0) {
            clickElement(By.cssSelector("#pvCodeSystem-0 a"));
        }

        clickElement(By.cssSelector("#pvCodeSystem-0 .fa-check"));
        newCdeVersion();
        
        mustBeLoggedInAs(ninds_username, password); 
        goToCdeByName("Post traumatic amnesia duration range");
        clickElement(By.linkText("Permissible Values"));
        textPresent("SNOMEDCT");
       
        logout();
        goToCdeByName("Post traumatic amnesia duration range");
        clickElement(By.id("pvs_tab"));
        textNotPresent("SNOMEDCT");
        textPresent("Login to see the value.");
    }    

    
}
