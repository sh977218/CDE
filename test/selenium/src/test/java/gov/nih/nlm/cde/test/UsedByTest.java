/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class UsedByTest extends NlmCdeBaseTest {
    
    @BeforeClass
    public void login() {
        loginAs(ctepCurator_username, ctepCurator_password);
    }

    @AfterClass
    public void logMeOut() {
        logout();
    }

    @Test
    public void addUsedBy() {
        goToCdeByName("Surgical Procedure Pelvis");
        findElement(By.linkText("Usage")).click();
        findElement(By.id("addUsedBy")).click();
        modalHere();
        findElement(By.name("usedBy")).sendKeys("ps");
        // test autocomplete
        Assert.assertTrue(textPresent("PS&CC"));
        findElement(By.name("usedBy")).clear();
        findElement(By.name("usedBy")).sendKeys("NINDS");
        findElement(By.id("saveUsedBy")).click();
        Assert.assertTrue(textPresent("Usage Added"));
        Assert.assertTrue(textPresent("NINDS"));
    }
    
    @Test
    public void removeUsedBy() {
        goToCdeByName("Patient Name");
        findElement(By.linkText("Usage")).click();
        String toRemove = findElement(By.id("usedBy-2")).getText();
        findElement(By.id("removeUsedBy-2")).click();
        findElement(By.id("confirmRemoveUsedBy-2")).click();
        org.testng.Assert.assertTrue(textPresent("Usage Removed"));
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf(toRemove) < 0);
     
    }
    
}
