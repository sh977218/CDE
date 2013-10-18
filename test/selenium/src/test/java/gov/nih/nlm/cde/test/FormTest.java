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
    
    @Test
        (dependsOnMethods = {"createForm"})
    public void addRemoveCart() {
        loginAs(ctepCurator_username, ctepCurator_password);
        driver.get(baseUrl + "/");
        findElement(By.id("formsLink")).click();
        findElement(By.name("search.name")).sendKeys("CtepTestForm1");
        findElement(By.id("search.submit")).click();
        findElement(By.partialLinkText("CtepTestForm1")).click();
        Assert.assertTrue(textPresent("Cart (0)"));
        findElement(By.linkText("Add to Cart")).click();
        Assert.assertTrue(textPresent("Cart (1)"));
        findElement(By.id("cartLink")).click();
        findElement(By.partialLinkText("CtepTestForm1")).click();
        findElement(By.linkText("Remove from Cart")).click();
        Assert.assertTrue(textPresent("Cart (0)"));
        logout();
    }
    
}
