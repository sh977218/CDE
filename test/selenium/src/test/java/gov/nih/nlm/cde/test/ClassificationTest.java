package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class ClassificationTest extends NlmCdeBaseTest {
    
    @BeforeClass
    public void login() {
        loginAs(ctepCurator_username, ctepCurator_password);
    }

    @AfterClass
    public void logMeOut() {
        logout();
    }
    
    @Test
    public void addClassification() {
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
        goToCdeByName("Cigarette");
        findElement(By.linkText("Classification")).click();
        String toRemove = findElement(By.id("classification-3-0")).getText();
        findElement(By.id("removeClassification-3-0")).click();
        findElement(By.id("confirmRemoveClassification-3-0")).click();
        Assert.assertTrue(textPresent("Classification Removed"));
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf(toRemove) < 0);
    }
    
}
