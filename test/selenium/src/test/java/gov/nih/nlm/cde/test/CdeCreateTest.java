package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeCreateTest extends BaseClassificationTest {

    @Test
    public void createCdeValidationErrors() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goHome();
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        textPresent("Please enter a name");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        findElement(By.name("elt.designation")).sendKeys("abc");
        textPresent("Please enter a definition");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        findElement(By.name("elt.definition")).sendKeys("abc");
        textPresent("Please select a steward");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText("NINDS");
        textPresent("Please select at least one classification");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        addClassificationMethod(new String[]{"CTEP", "DISEASE", "Gynecologic"});
        textPresent("Please select at least one classification owned by NINDS");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        addClassificationMethod(new String[]{"NINDS", "Population", "Adult"});
        textNotPresent("Please");
        Assert.assertTrue(findElement(By.id("submit")).isEnabled());
    }
    
}
