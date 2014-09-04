
package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class VsacTest extends NlmCdeBaseTest {
    
    @Test
    public void importVsacValues() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToElementByName("Patient Race Category");
        findElement(By.linkText("Permissible Values")).click();         
        Assert.assertTrue(textPresent("Native Hawaiian or other Pacific Islander")); 
        Assert.assertTrue(textNotPresent("Match"));
        findElement(By.id("removeAllPvs")).click();
        Assert.assertTrue(textNotPresent("Native Hawaiian or other Pacific Islander"));        
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.836");
        findElement(By.id("vsacIdCheck")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));
        findElement(By.id("addVsacValue-0")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-valid")));
        findElement(By.id("addAllVsac")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-1-valid")));   
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-2-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-3-valid")));
        findElement(By.id("pvRemove-0")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));        
        
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Importing All VSAC Values");
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("5");        
        saveCde();
        
        goToElementByName("Patient Race Category");
        findElement(By.linkText("Permissible Values")).click(); 
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-1-valid")));   
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-2-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-3-valid")));        
    }   
    
    
   @Test
    public void assignVsacId() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToElementByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("No Value Set specified."));
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("invalidId");
        findElement(By.id("vsacIdCheck")).click();
        Assert.assertTrue(textPresent("Invalid VSAC OID"));
        closeAlert();
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.837");
        findElement(By.id("vsacIdCheck")).click();
        // check that version got fetched.
        Assert.assertTrue(textPresent("20121025"));
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Adding vsac Id");
        Assert.assertTrue(textPresent("This version number has already been used"));
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("3");
        saveCde();
        
        goToElementByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("20121025"));
        Assert.assertTrue(textPresent("2135-2"));
        Assert.assertTrue(textPresent("CDCREC"));
        WebElement tbody = driver.findElement(By.id("vsacTableBody"));
        List<WebElement> vsacLines = tbody.findElements(By.tagName("tr"));
        Assert.assertEquals(vsacLines.size(), 2);
        Assert.assertTrue(textPresent("Match"));
    }
    
    @Test
    public void removeVsacId() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToElementByName("Left Colon Excision Ind-2");
        findElement(By.linkText("Permissible Values")).click();   
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.837");
        findElement(By.id("vsacIdCheck")).click();
        
        Assert.assertTrue(textPresent("20121025"));
                
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("version")).sendKeys(".1");
        saveCde();

        goToElementByName("Left Colon Excision Ind-2");
        findElement(By.linkText("Permissible Values")).click();   
        findElement(By.id("removeVSButton")).click();

        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("removeVSButton")));
        Assert.assertEquals(driver.findElement(By.cssSelector("BODY")).getText().indexOf("2.16.840.1.114222.4.11.837"), -1);

        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("2");
        saveCde();
        
        goToElementByName("Left Colon Excision Ind-2");
        findElement(By.linkText("Permissible Values")).click();   
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("removeVSButton")));
    }
        
    @Test(dependsOnMethods = {"importVsacValues"})
    public void modifyValueCode() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToElementByName("Patient Race Category");
        findElement(By.linkText("Permissible Values")).click();         
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-valid")));
        findElement(By.cssSelector("#pvName-4 .fa-edit")).click(); 
        findElement(By.cssSelector("#pvName-4 input.typeahead")).sendKeys(" Category");
        findElement(By.cssSelector("#pvName-4 .fa-check")).click();
        hangon(1);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-warning")));
        
        findElement(By.cssSelector("#pvCode-4 .fa-edit")).click(); 
        findElement(By.cssSelector("#pvCode-4 input")).sendKeys(".1");
        findElement(By.cssSelector("#pvCode-4 .fa-check")).click();  
        
        findElement(By.cssSelector("#pvCodeSystem-4 .fa-edit")).click(); 
        findElement(By.xpath("//td[@id='pvCodeSystem-4']//input")).sendKeys(".1");
        findElement(By.cssSelector("#pvCodeSystem-4 .fa-check")).click();        
        
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).clear();
        findElement(By.name("changeNote")).sendKeys("Modified VS Codes");
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("6");        
        saveCde();
        
        goToElementByName("Patient Race Category");  
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Other Race Category"));
        Assert.assertTrue(textPresent("2131-1.1"));
        Assert.assertTrue(textPresent("CDCREC.1"));
    }      
    
}
