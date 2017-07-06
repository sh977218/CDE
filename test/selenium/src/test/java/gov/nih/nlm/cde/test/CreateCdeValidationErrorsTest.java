package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CreateCdeValidationErrorsTest extends BaseClassificationTest {

    @Test
    public void createCdeValidationErrors() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goHome();
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        textPresent("Please enter a name for the new CDE");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        findElement(By.name("eltName")).sendKeys("abc");
        textPresent("Please enter a definition for the new CDE");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        findElement(By.name("eltDefinition")).sendKeys("abc");
        textPresent("Please select a steward for the new CDE");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        new Select(findElement(By.id("eltStewardOrgName"))).selectByVisibleText("NINDS");
        textPresent("Please select at least one classification");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        addClassificationToNewCdeMethod(new String[]{"CTEP", "DISEASE", "Gynecologic"});
        textPresent("Please select at least one classification owned by NINDS");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        addClassificationToNewCdeMethod(new String[]{"NINDS", "Population", "Adult"});
        textNotPresent("Please");
        Assert.assertTrue(findElement(By.id("submit")).isEnabled());
    }
    
}
