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
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(".1");
        driver.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS);
        findElement(By.id("confirmSave")).click();
        modalGone();

        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("New Name"));

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("removeNaming-0")));
        findElement(By.id("name_edit_1")).click();
        findElement(By.id("name_input_1")).sendKeys(" Changed");
        findElement(By.id("name_confirm_1")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("2");
        findElement(By.id("confirmSave")).click();
        modalGone();

        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("New Name Changed"));

        findElement(By.id("def_edit_1")).click();
        findElement(By.id("def_input_1")).sendKeys(" Changed");
        findElement(By.id("def_confirm_1")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("3");
        findElement(By.id("confirmSave")).click();
        modalGone();

        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("New Definition Changed"));

        findElement(By.id("context_edit_1")).click();
        findElement(By.id("context_input_1")).sendKeys(" Changed");
        findElement(By.id("context_confirm_1")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("4");
        findElement(By.id("confirmSave")).click();
        modalGone();

        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("Health Changed"));

        findElement(By.id("removeNaming-1")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("5");
        findElement(By.id("confirmSave")).click();
        modalGone();
        
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("New Name") < 0);
        
    }
    
    
}
