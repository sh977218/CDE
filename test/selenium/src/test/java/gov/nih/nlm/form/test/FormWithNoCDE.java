package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormWithNoCDE extends NlmCdeBaseTest {

    @Test
    public void formWithNoCDE() {
        goToFormByName("Form with no CDE");
        textPresent("This form is empty. Form Editors can add content to this form by navigating to");
    }

}
