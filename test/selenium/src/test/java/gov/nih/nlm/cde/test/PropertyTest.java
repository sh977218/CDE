package gov.nih.nlm.cde.test;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PropertyTest extends NlmCdeBaseTest {
    
    @Test
    public void addRemoveProperty() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        String cdeName = "Intravesical Protocol Agent Administered Specify";
        goToCdeByName(cdeName);
        findElement(By.linkText("Properties")).click();
        findElement(By.id("addProperty")).click();
        modalHere();
        findElement(By.name("key")).sendKeys("MyKey1");
        findElement(By.name("value")).sendKeys("MyValue1");
        findElement(By.id("createProperty")).click();
        Assert.assertTrue(textPresent("Property Added"));
        modalGone();
        findElement(By.id("addProperty")).click();
        modalHere();
        findElement(By.name("key")).sendKeys("MyKey2");
        findElement(By.name("value")).sendKeys("MyValue2");
        findElement(By.id("createProperty")).click();
        Assert.assertTrue(textPresent("Property Added"));
        modalGone();
        findElement(By.id("addProperty")).click();
        modalHere();
        findElement(By.name("key")).sendKeys("MyKey3");
        findElement(By.name("value")).sendKeys("MyValue3");
        findElement(By.id("createProperty")).click();
        Assert.assertTrue(textPresent("Property Added"));
        modalGone();

        findElement(By.id("removeProperty-1")).click();
        findElement(By.id("confirmRemoveProperty-1")).click();
        Assert.assertTrue(textPresent("Property Removed"));
        
        goToCdeByName(cdeName);
        findElement(By.linkText("Properties")).click();
        Assert.assertTrue(textPresent("MyKey1"));
        Assert.assertTrue(textPresent("MyKey3"));
        Assert.assertTrue(textPresent("MyValue1"));
        Assert.assertTrue(textPresent("MyValue3"));
        Assert.assertTrue(textNotPresent("MyValue2"));
        Assert.assertTrue(textNotPresent("MyValue2"));
        
    }
    
    
}
