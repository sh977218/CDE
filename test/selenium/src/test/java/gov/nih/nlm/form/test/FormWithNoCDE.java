package gov.nih.nlm.form.test.properties.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormWithNoCDE extends NlmCdeBaseTest {

    @Test
    public void formWithNoCDE() {
        goToFormByName("Form with no CDE");
        textPresent("This form has no content. There is nothing to preview.");
    }

}
