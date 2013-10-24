package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormTest extends NlmCdeBaseTest {
    
    private static String testFormName = "CtepTestForm1";
    
    @Test
    public void createForm() {
        loginAs(ctepCurator_username, ctepCurator_password);
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("Form")).click();
        findElement(By.name("form.name")).sendKeys(testFormName);
        findElement(By.name("form.instructions")).sendKeys("Instructions for Ctep Form 1");
        new Select(findElement(By.name("form.stewardOrg.name"))).selectByVisibleText("CTEP");
        findElement(By.id("form.submit")).click();        
        goToFormByName(testFormName);
        Assert.assertTrue(findElement(By.id("dd_name")).getText().equals(testFormName));
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
        findElement(By.name("search.name")).sendKeys(testFormName);
        findElement(By.id("search.submit")).click();
        findElement(By.partialLinkText(testFormName)).click();
        Assert.assertTrue(textPresent("Cart (0)"));
        findElement(By.linkText("Add to Cart")).click();
        Assert.assertTrue(textPresent("Cart (1)"));
        findElement(By.id("cartLink")).click();
        findElement(By.partialLinkText(testFormName)).click();
        findElement(By.linkText("Remove from Cart")).click();
        Assert.assertTrue(textPresent("Cart (0)"));
        logout();
    }
    
    @Test
        (dependsOnMethods = {"createForm"})
    public void addSection() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToFormByName(testFormName);
        findElement(By.id("addSection-0")).click();
        findElement(By.xpath("//h3[@id = 'Untitled Section']/inline-edit/div/div[1]/i")).click();
        findElement(By.xpath("//h3[@id = 'Untitled Section']/inline-edit/div/div[2]/input")).clear();
        findElement(By.xpath("//h3[@id = 'Untitled Section']/inline-edit/div/div[2]/input")).sendKeys("Section 1 of this form");
        findElement(By.xpath("//h3[@id = 'Untitled Section']/inline-edit/div/div[2]/button[@class = 'icon-ok']")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        goToFormByName(testFormName);
        Assert.assertTrue(textPresent("Section 1 of this form"));
        logout();
    }
    
}
