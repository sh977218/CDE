package gov.nih.nlm.form.test;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class FormClassificationTest extends BaseFormTest{            
    @Test
    public void formClassificationLink() {
        goToFormByName("Skin Cancer Patient");
        findElement(By.linkText("Classification")).click();
        textPresent("Disease");
        textPresent("Headache");
        textPresent("Participant/Subject History and Family History");          
        findElement(By.linkText("Participant/Subject History and Family History")).click();
        textPresent("Participant/Subject History and Family History (2)");   
        textPresent("Skin Cancer Patient");
        textPresent("Vision Deficit Report");               
    }
    
    @Test
    public void addClassification() {
        mustBeLoggedInAs("ninds", "pass");
        goToFormByName("Traumatic Brain Injury - Adverse Events");
        addClassificationMethod(new String[]{"NINDS","Disease","Traumatic Brain Injury"});          
    }    
}
