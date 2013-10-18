/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class FormTest extends NlmCdeBaseTest {
    
    @Test
    public void createForm() {
        loginAs(ctepCurator_username, ctepCurator_password);
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("Form")).click();
        findElement(By.name("form.name")).sendKeys("CtepTestForm1");
        findElement(By.name("form.instructions")).sendKeys("Instructions for Ctep Form 1");
        new Select(findElement(By.name("form.stewardOrg.name"))).selectByVisibleText("CTEP");
        findElement(By.id("form.submit")).click();        
        goToFormByName("CtepTestForm1");
        Assert.assertTrue(findElement(By.id("dd_name")).getText().equals("CtepTestForm1"));
        Assert.assertTrue(findElement(By.id("dd_owner")).getText().equals("CTEP"));
        Assert.assertTrue(findElement(By.id("dd_instructions")).getText().equals("Instructions for Ctep Form 1")); 
        Assert.assertTrue(findElement(By.id("dd_createdBy")).getText().equals(ctepCurator_username));
        Assert.assertEquals(findElement(By.id("dt_createdBy")).getLocation().y, findElement(By.id("dd_createdBy")).getLocation().y);
        logout();
    }
    
}
