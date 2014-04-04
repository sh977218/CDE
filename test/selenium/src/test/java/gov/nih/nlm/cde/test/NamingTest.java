/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.nih.nlm.cde.test;

import java.util.concurrent.TimeUnit;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class NamingTest extends NlmCdeBaseTest {
    
    @BeforeClass
    public void login() {
        loginAs(ctepCurator_username, ctepCurator_password);
    }

    @AfterClass
    public void logMeOut() {
        logout();
    }

    @Test
    public void addRemoveEdit() {
        String cdeName = "Radiation Therapy Modality";
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
        driver.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS);
        findElement(By.id("confirmSave")).click();
        hangon(2);

        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("New Name"));

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("removeNaming-0")));
        findElement(By.cssSelector("#dd_name_1 .fa-edit")).click();
        findElement(By.cssSelector("#dd_name_1 input")).sendKeys(" Changed");
        findElement(By.cssSelector("#dd_name_1 .fa-check")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("2");
        findElement(By.id("confirmSave")).click();
        hangon(2);

        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("New Name Changed"));

        findElement(By.cssSelector("#dd_def_1 .fa-edit")).click();
        findElement(By.cssSelector("#dd_def_1 textarea ")).sendKeys(" Changed");
        findElement(By.cssSelector("#dd_def_1 .fa-check")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("3");
        findElement(By.id("confirmSave")).click();
        hangon(2);

        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("New Definition Changed"));

        findElement(By.cssSelector("#dd_context_1 .fa-edit")).click();
        findElement(By.cssSelector("#dd_context_1 input")).sendKeys(" Changed");
        findElement(By.cssSelector("#dd_context_1 .fa-check")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("4");
        findElement(By.id("confirmSave")).click();
        hangon(2);

        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("Health Changed"));

        findElement(By.id("removeNaming-1")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("5");
        findElement(By.id("confirmSave")).click();
        hangon(2);
        
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("New Name") < 0);
        
    }
    
    
}
