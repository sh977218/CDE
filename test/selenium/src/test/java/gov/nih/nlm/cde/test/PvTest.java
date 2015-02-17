
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
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("added to pv"));
        findElement(By.linkText("History")).click();
        hangon(1);
        findElement(By.xpath("//table[@id = 'historyTable']//tr[2]//td[4]/a")).click();
        Assert.assertTrue(textPresent("Permissible Values:"));
        Assert.assertTrue(textPresent("Modified"));
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
    
    @Test
    public void addRemovePv() {
        String cdeName = "Surgical Procedure Hand Laparoscopic Port Anatomic Site";
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Right Middle Abdomen"));
        findElement(By.id("pvRemove-8")).click();
        findElement(By.id("addPv")).click();
        findElement(By.xpath("//td[@id='pv-10']//i")).click();
        findElement(By.xpath("//td[@id='pv-10']//input")).clear();
        findElement(By.xpath("//td[@id='pv-10']//input")).sendKeys("New PV");
        findElement(By.cssSelector("#pv-10 .fa-check")).click();
        
        findElement(By.cssSelector("#pv-10 [typeahead-source=\"pVTypeaheadCodeSystemNameList\"] .fa-edit")).click();
        Assert.assertTrue(textPresent("Confirm"));
        findElement(By.xpath("//td[@id='pvCodeSystem-10']//input")).sendKeys("N");
        Assert.assertTrue(textPresent("NCI Thesaurus"));
        newCdeVersion();
        textPresent("Qualified");
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("New PV"));
        Assert.assertEquals(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Right Middle Abdomen"), -1);
    }
    
    @Test
    public void reOrderPv() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Involved Organ Laterality Type");
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.id("pvCode-2"), "C25229"));
        Assert.assertEquals(findElement(By.id("pvCode-6")).getText(), "C25594,C48046,C13717");
        findElement(By.id("pvUp-2")).click();
        findElement(By.id("pvDown-6")).click();
        newCdeVersion("Reordered PV");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertEquals(findElement(By.id("pvCode-1")).getText(), "C25229");
        Assert.assertEquals(findElement(By.id("pvCode-7")).getText(), "C25594,C48046,C13717");
    }
    
}
