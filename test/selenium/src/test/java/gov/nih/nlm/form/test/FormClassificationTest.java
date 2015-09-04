package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.ClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormClassificationTest extends BaseFormTest {            
    @Test
    public void formClassificationLink() {
        goToFormByName("Skin Cancer Patient");
        findElement(By.linkText("Classification")).click();
        textPresent("Disease");
        textPresent("Headache");
        textPresent("Participant/Subject History and Family History");          
        findElement(By.linkText("Participant/Subject History and Family History")).click();
        textPresent("Skin Cancer Patient");
    }
    
    @Test
    public void addClassification() {
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("Traumatic Brain Injury - Adverse Events");
        waitAndClick(By.linkText("Classification"));
        new ClassificationTest().addClassificationMethod(new String[]{"NINDS","Disease","Traumatic Brain Injury"});          
    }  
    
    @Test
    public void classifyFormCdes() {
        mustBeLoggedInAs(ctepCurator_username, password);

        goToFormByName("Intraoperative Management");
        findElement(By.linkText("Classification")).click();
        findElement(By.id("classifyAllCdes")).click();
        clickElement(By.cssSelector("[id='addClassification-ABTC'] span.fake-link"));
        clickElement(By.cssSelector("[id='addClassification-ABTC 0904'] button"));
        
        // Verify
        goToCdeByName("Inadvertent hypocapnia indicator");
        findElement(By.linkText("Classification")).click();
        textPresent("ABTC");
        textPresent("ABTC 0904");

        goToCdeByName("Foley catheter indicator");
        findElement(By.linkText("Classification")).click();
        textPresent("ABTC");
        textPresent("ABTC 0904");

    }
}
