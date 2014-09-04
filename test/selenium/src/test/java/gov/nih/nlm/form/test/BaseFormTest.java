package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

public class BaseFormTest extends NlmCdeBaseTest {
    
    protected String module = "form";

    protected void createForm(String name, String definition, String version, String org) {
        gotoFormCreate();
        Assert.assertTrue(textPresent("Create New Form"));
        fillInput("Name", name);
        fillInput("Description", definition);
        fillInput("Version", version);
        new Select(findElement(By.id("newForm.stewardOrg.name"))).selectByVisibleText(org);
        findElement(By.xpath("//button[text()='Save']")).click();
        textPresent("Form created");
        closeAlert();
        hangon(1);
    }
    
    protected void gotoFormCreate() {
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("Form")).click();    
    }
    
    protected void fillInput(String type, String value) {
        findElement(By.xpath("//label[text()=\""+type+"\"]/following-sibling::input")).sendKeys(value); 
    }   
    
    protected void gotoPublicForms() {
        findElement(By.linkText("Forms")).click();    
        findElement(By.id("resetSearch")).click();
    }
    
    protected void saveForm() {
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys("1");
        findElement(By.id("confirmSave")).click();  
        textPresent("Saved.");
        closeAlert();
        hangon(1);
    }

    protected void searchForm(String query) {
        findElement(By.name("ftsearch")).sendKeys(query);
        findElement(By.id("search.submit")).click();    
    }
}
