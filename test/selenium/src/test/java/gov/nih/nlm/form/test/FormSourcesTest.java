package gov.nih.nlm.form.test;

import org.testng.annotations.Test;

public class FormSourcesTest extends BaseFormTest {

    @Test
    public void formSourceTest() {
        String formName = "Traumatic Brain Injury - Adverse Events";
        goToFormByName(formName);
        goToGeneralDetail();
        textPresent("Name:");
        textPresent("caBIG");
        textPresent("Created:");
        textPresent("12/10/2004");
        textPresent("Updated:");
        textPresent("10/17/2006");
        textPresent("Registration Status:");
        textPresent("standard");
        textPresent("Datatype:");
        textPresent("Number");
    }
}