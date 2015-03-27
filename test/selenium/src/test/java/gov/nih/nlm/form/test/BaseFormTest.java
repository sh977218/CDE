package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

import java.util.concurrent.TimeoutException;

public class BaseFormTest extends NlmCdeBaseTest {

    protected void startAddingQuestions() {
        scrollToTop();
        try {
            textPresent("Show Question Search", By.id("startAddingQuestions"), 2);
            findElement(By.id("startAddingQuestions")).click();
        } catch (Exception e) {
            // if button does not say show, then don't click it.
        }
    }

    public void stopAddingQuestions() {
        scrollToTop();
        textPresent("Hide Question Search", By.id("startAddingQuestions"), 2);
        findElement(By.id("startAddingQuestions")).click();
    }
    
    protected void gotoPublicForms() {
        findElement(By.linkText("Forms")).click();    
        showSearchFilters();
    }
    
    protected void saveForm() {
        scrollToViewById("openSaveBottom");
        findElement(By.id("openSaveBottom")).click();
        findElement(By.name("version")).sendKeys("1");
        findElement(By.id("confirmNewVersion")).click();  
        textPresent("Saved.");
        closeAlert();
        hangon(1);
        scrollToTop();
    }

    protected void searchForm(String query) {
        findElement(By.name("ftsearch")).sendKeys("\"" + query + "\"");
        findElement(By.id("search.submit")).click();    
    }
    
    protected void gotoFormCreate() {
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("Form")).click();
        textPresent("Create New Form");
    }

    public void createForm(String name, String definition, String version, String org) {
        gotoFormCreate();
        findElement(By.id("formName")).sendKeys(name);
        findElement(By.id("formDefinition")).sendKeys(definition);
        if (version != null) {
            fillInput("Version", version);
        }
        new Select(findElement(By.id("newForm.stewardOrg.name"))).selectByVisibleText(org);
        findElement(By.xpath("//button[text()='Save']")).click();
        textPresent("Form created");
        closeAlert();
        hangon(1);
    }
    
}
