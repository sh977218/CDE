package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

public abstract class PropertyTest extends NlmCdeBaseTest {
    
    public abstract void goToEltByName(String name);
    
    public void addRemoveProperty(String eltName) {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToEltByName(eltName);
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
        
        goToEltByName(eltName);
        findElement(By.linkText("Properties")).click();
        Assert.assertTrue(textPresent("MyKey1"));
        Assert.assertTrue(textPresent("MyKey3"));
        Assert.assertTrue(textPresent("MyValue1"));
        Assert.assertTrue(textPresent("MyValue3"));
        Assert.assertTrue(textNotPresent("MyValue2"));
        Assert.assertTrue(textNotPresent("MyValue2"));
        
    }
    
    public void richText(String eltName) {
        mustBeLoggedInAs(ninds_username, ninds_password);
        goToEltByName(eltName);
        findElement(By.linkText("Properties")).click();
        hangon(2);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//dd[@id='dd_prop_value_1']//i[@class='fa fa-edit']")));
        findElement(By.xpath("//dd[@id='dd_prop_value_1']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//dd[@id='dd_prop_value_1']//button[@btn-radio=\"'html'\"]")).click();
        findElement(By.xpath("//dd[@id='dd_prop_value_1']//div[@id='taTextElement']")).sendKeys(" Hello From Selenium  ");
        findElement(By.xpath("//dd[@id='dd_prop_value_1']//button[@class='fa fa-check']")).click();
        hangon(1);
        Assert.assertTrue(textPresent("Hello From Selenium"));
    }
    
    
}