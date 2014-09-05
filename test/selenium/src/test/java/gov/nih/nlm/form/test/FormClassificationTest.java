package gov.nih.nlm.form.test;

import org.testng.annotations.Test;

public class FormClassificationTest extends BaseFormTest{            
    @Test
    public void formClassificationLink() {
        goToFormByName("Skin Cancer Patient");
        textPresent("Disease");
        textPresent("Headache");
        textPresent("Participant/Subject History and Family History");          
        findElement(By.linkText("Participant/Subject History and Family History")).click();
        textPresent("Participant/Subject History and Family History (2)");   
        textPresent("Skin Cancer Patient");
        textPresent("Vision Deficit Report");               
    }
}
