package gov.nih.nlm.form.test.render;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormNativeRenderTest extends NlmCdeBaseTest {

    @Test
    public void nativeFormRenderTest() {
        String formName = "Loinc Widget Test Form";
        goToFormByName(formName);
        textPresent("Outside section form: PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("Inside section form: PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("Are you able to get on and off the toilet?");
    }
}
