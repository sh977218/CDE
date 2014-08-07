package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class FormCreateTest extends NlmCdeBaseTest {
    
    protected void gotoFormCreate() {
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("Form")).click();    
    }
    
    protected void fillInput(String type, String value) {
        findElement(By.xpath("//label[text()=\""+type+"\"]/following-sibling::input")).sendKeys(value); 
    }   
    
    protected void gotoPublicForms() {
        findElement(By.linkText("Forms")).click();    
    }
    
    @Test
    public void createForm() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        gotoFormCreate();
        Assert.assertTrue(textPresent("Create New Form"));
        fillInput("Name", "First Form");
        fillInput("Definition", "Fill out carefully!");
        fillInput("Version", "0.1alpha");
        new Select(findElement(By.id("newForm.stewardOrg.name"))).selectByVisibleText("CTEP");
        findElement(By.xpath("//button[text()='Save']")).click();
        hangon(1);
        
        gotoPublicForms();        
        Assert.assertTrue(textPresent("First Form"));
        Assert.assertTrue(textPresent("Fill out carefully!"));
        Assert.assertTrue(textPresent("0.1alpha"));        
    }
}