package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ClassificationTest extends NlmCdeBaseTest {
    
    @Test
    public void addClassification() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Pills Quantity");
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
        
        goToCdeByName("Pills Quantity");
        findElement(By.linkText("Classification")).click();
        Assert.assertTrue(textPresent("MyCategory"));
        Assert.assertTrue(textPresent("MyClassification"));
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
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf(toRemove) < 0);
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
}
