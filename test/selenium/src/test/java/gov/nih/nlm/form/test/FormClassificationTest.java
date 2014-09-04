package gov.nih.nlm.form.test;

import org.testng.annotations.Test;

public class FormClassificationTest extends BaseFormTest{            
    @Test
    public void formClassificationLink() {
        goToFormByName("Skin Cancer Patient");
        textPresent("Disease");
        textPresent("Headache");
        textPresent("Participant/Subject History and Family History");          
    }
}
