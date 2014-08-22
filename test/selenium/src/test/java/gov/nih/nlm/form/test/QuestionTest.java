package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.testng.annotations.Test;

public class QuestionTest extends BaseFormTest {
    
    @Test
    public void questions() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);

        String formName = "Questions Form Test";
        String formDef = "Form to test adding questions. ";
        String formV = "0.1alpha";

        createForm(formName, formDef, formV, "CTEP");
        
        new SectionTest().addSection("Patient Information", null);
        
        findElement(By.id("startAddingQuestions")).click();
        
        
        
        findElement(By.name("ftsearch")).sendKeys("\"person birth date\"");
        findElement(By.id("search.submit")).click();
        
        WebElement sourceElt = driver.findElement(By.id("acc_link_0"));
        WebElement targetElt = driver.findElement(By.id("dropQuestionsHere"));

        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();

        saveForm();
        
    }
    
}
