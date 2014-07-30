/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NamingTest extends NlmCdeBaseTest {
 
    @Test
    public void addRemoveEdit() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        String cdeName = "Principal Investigator State java.lang.String";
        goToCdeByName(cdeName);
        findElement(By.linkText("Naming")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("removeNaming-0")));
        findElement(By.id("addNamePair")).click();
        modalHere();
        findElement(By.name("designation")).sendKeys("New Name");
        findElement(By.name("definition")).sendKeys("New Definition");
        findElement(By.id("createNamePair")).click();
        modalGone();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(".1");
        saveCde();

        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("New Name"));

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("removeNaming-0")));
        findElement(By.cssSelector("#dd_name_1 .fa-edit")).click();
        findElement(By.cssSelector("#dd_name_1 input")).sendKeys(" Changed");
        findElement(By.cssSelector("#dd_name_1 .fa-check")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("2");
        saveCde();

        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("New Name Changed"));

        findElement(By.cssSelector("#dd_def_1 .fa-edit")).click();
        findElement(By.cssSelector("#dd_def_1 textarea ")).sendKeys(" Changed");
        findElement(By.cssSelector("#dd_def_1 .fa-check")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("3");
        saveCde();

        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("New Definition Changed"));

        findElement(By.cssSelector("#dd_context_1 .fa-edit")).click();
        findElement(By.cssSelector("#dd_context_1 input")).sendKeys(" Changed");
        findElement(By.cssSelector("#dd_context_1 .fa-check")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("4");
        saveCde();

        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("Health Changed"));

        findElement(By.id("removeNaming-1")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("5");
        saveCde();
        
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("New Name") < 0);
        
    }
    
    
}
