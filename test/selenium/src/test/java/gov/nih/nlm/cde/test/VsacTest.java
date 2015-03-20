
package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class VsacTest extends NlmCdeBaseTest {
    
    @Test
    public void importVsacValues() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Patient Race Category");
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
        
        newCdeVersion("Importing All VSAC Values");

        findElement(By.linkText("Permissible Values")).click(); 
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-1-valid")));   
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-2-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-3-valid")));        
    }   
    
    
   @Test
    public void assignVsacId() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Patient Ethnic Group Category");
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
        newCdeVersion("Adding vsac Id");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("20121025"));
        Assert.assertTrue(textPresent("2135-2"));
        Assert.assertTrue(textPresent("CDCREC"));
        WebElement tbody = driver.findElement(By.id("vsacTableBody"));
        List<WebElement> vsacLines = tbody.findElements(By.tagName("tr"));
        Assert.assertEquals(vsacLines.size(), 2);
        Assert.assertTrue(textPresent("Match"));
    }
    
}
