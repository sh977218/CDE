package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.support.ui.Select;

public class ClassificationTest extends NlmCdeBaseTest {
    
    private void addClassif() {
        findElement(By.linkText("Classification")).click();
        findElement(By.id("addClassification")).click();
        modalHere();
        findElement(By.name("conceptSystem")).sendKeys("TCGA");
        // Test autocomplete
        Assert.assertTrue(textPresent("2.6 by Namespace"));
        findElement(By.name("conceptSystem")).clear();
        findElement(By.name("conceptSystem")).sendKeys("MyCategory");
        findElement(By.name("concept")).sendKeys("MyClassification");
        findElement(By.id("saveClassification")).click();
        Assert.assertTrue(textPresent("Classification Added"));
    }
    
    @Test
    public void addClassification() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Pills Quantity");
        addClassif();        
        goToCdeByName("Pills Quantity");
        findElement(By.linkText("Classification")).click();
        Assert.assertTrue(textPresent("MyCategory"));
        Assert.assertTrue(textPresent("MyClassification"));
    }
    
    @Test
    public void classifyAs() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        goToCdeByName("Noncompliant Reason Text");
        addClassif();     
        findElement(By.id("addClassification")).click();
        modalHere();
        new Select(findElement(By.cssSelector("select[name='orgName']"))).selectByIndex(1);        
        findElement(By.name("conceptSystem")).sendKeys("CATEGORY");
        findElement(By.name("concept")).sendKeys("AdEERS");        
        findElement(By.id("saveClassification")).click();
        Assert.assertTrue(textPresent("Classification Added"));        
        goToCdeByName("Noncompliant Reason Text");
        findElement(By.linkText("Classification")).click();        
        Assert.assertTrue(driver.findElement(By.cssSelector("#conceptSystem-caBIG-MyCategory [data-id='classification-2-0']")).getText().equals("MyClassification"));
        Assert.assertTrue(driver.findElement(By.cssSelector("#conceptSystem-CTEP-CATEGORY [data-id='classification-0-0']")).getText().equals("AdEERS"));
    }
    
    @Test
    public void removeClassification() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Cigarette");
        findElement(By.linkText("Classification")).click();
        String toRemove = findElement(By.id("classification-3-0")).getText();
        findElement(By.id("removeClassification-3-0")).click();
        findElement(By.id("confirmRemoveClassification-3-0")).click();
        Assert.assertTrue(textPresent("Classification Removed"));
        findElement(By.linkText("Classification")).click();
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().contains(toRemove));
    }
    
    @Test
    public void classificationLink() {
        goToCdeByName("Cigarette Average");
        findElement(By.linkText("Classification")).click();
        findElement(By.linkText("Iloprost 12079")).click();
        Assert.assertTrue(textPresent("Iloprost 12079"));
        Assert.assertTrue(textPresent("Iloprost Trial"));  
        Assert.assertTrue(textPresent("Patient Gender Category"));
        Assert.assertTrue(textPresent("Patient Ethnic Group Category"));
        Assert.assertTrue(textPresent("Cigarette Average Daily Pack Use Count"));
        List <WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 3);
    }    
    
    @Test
    public void deepClassifications() {
        goToCdeByName("snore frequency");
        findElement(By.linkText("Classification")).click();
     
        Assert.assertTrue(textPresent("Adult"));
        Assert.assertTrue(textPresent("Parkinson's Disease"));
        Assert.assertTrue(textPresent("Classification"));
        Assert.assertTrue(textPresent("Supplemental"));
        Assert.assertTrue(textPresent("Outcomes and End Points"));
        Assert.assertTrue(textPresent("Other Non-Motor"));
    }
}
