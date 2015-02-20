
package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.testng.Assert;
import org.testng.annotations.Test;


public class Section2Test extends BaseFormTest {
    
    private SectionTest sectionTest = new SectionTest();
    
    @Test
    public void questionsLayoutTest() {
        Dimension currentWindowSize = getWindowSize();
        resizeWindow(1024, 1150);
        
        mustBeLoggedInAs(ctepCurator_username, password);
        String formName = "Question Layout Test Form";
        String formDef = "This form is used to test the permission of tests";
        String formV = "0.1";

        createForm(formName, formDef, formV, "CTEP");
        
        String sec1 = "first section";
        String sec2 = "second section";
        
        sectionTest.addSection(sec1, "0 or more");
        sectionTest.addSection(sec2, "0 or more");
        
        textPresent(sec1);
        textPresent(sec2);
        
        textPresent("Show Question Search Area");
        startAddingQuestions();
        textPresent("Hide Question Search Area");
        textPresent("results for");
        
        findElement(By.id("showHideFilters")).click();
        textPresent("Show Filters");
        
        findElement(By.id("removeElt-1")).click();
        textNotPresent(sec2);
        findElement(By.id("removeElt-0")).click();
        textNotPresent(sec1);
        
        textPresent("There is no content yet.");
        
        String sec3 = "thrid section";
        sectionTest.addSection(sec3, "0 or more");
        
        textNotPresent("Show Filters");
        textNotPresent("results for");
        
        resizeWindow(currentWindowSize.getWidth(), currentWindowSize.getHeight());
    }

    @Test
    public void formPermissionTest() {
        Dimension currentWindowSize = getWindowSize();
        resizeWindow(1024, 1150);
        
        mustBeLoggedInAs(ninds_username, password);
        String formName = "Form Permission Test";
        
        goToFormByName(formName, "Recorded");
        findElement(By.linkText("Form Description")).click();
        
        String sec1 = "test permission section";
        sectionTest.addSection(sec1, "0 or more");
        textPresent(sec1);
        saveForm();
        
        mustBeLoggedInAs(ctepCurator_username, password);
        goToFormByName(formName, "Recorded");
        findElement(By.linkText("Form Description")).click();
        textNotPresent("Delete");
        textNotPresent("Add Section");
        textNotPresent("Show Question Search Area");
        
        resizeWindow(currentWindowSize.getWidth(), currentWindowSize.getHeight());
    }
    
    @Test
    public void dragHandleVisibility() {
        mustBeLoggedOut();
        goToFormByName("Intraoperative Management");
        findElement(By.linkText("Form Description")).click();
        Assert.assertEquals(findElement(By.cssSelector("div.formSectionArea")).findElements(By.cssSelector("i.question-move-handle")).size(), 0);
        Assert.assertEquals(driver.findElements(By.cssSelector("i.section-move-handle")).size(), 0);

        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("Intraoperative Management");
        findElement(By.linkText("Form Description")).click();
        findElement(By.cssSelector("div.formSectionArea")).findElement(By.cssSelector("i.question-move-handle"));
        findElement(By.cssSelector("div.formSectionArea")).findElement(By.cssSelector("i.section-move-handle"));
    }   
    
}
