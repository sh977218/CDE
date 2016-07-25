package gov.nih.nlm.form.test;

import org.testng.annotations.Test;

public class FormGeneralInfoTest extends BaseFormTest {
    
    @Test
    public void formGeneralInformationTest() {
        goToFormByName("Section Inside Section Form");
        textPresent("Date Created:");
        textPresent("Updated:");
        textPresent("Created By:");
    }

}
