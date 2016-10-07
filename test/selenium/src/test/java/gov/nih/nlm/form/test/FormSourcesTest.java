package gov.nih.nlm.form.test;

import org.testng.annotations.Test;

public class FormSourcesTest extends BaseFormTest {

    @Test
    public void formSourceTest() {
        String formName = "Traumatic Brain Injury - Adverse Events";
        goToFormByName(formName);
        textPresent("Source Name:");
        textPresent("caBIG");
        textPresent("Source Created Date:");
        textPresent("12/10/2004 @ 3:59PM");
        textPresent("Source Modified Date:");
        textPresent("10/17/2006 @ 4:59PM");
        textPresent("Source Status:");
        textPresent("standard");
        textPresent("Source Datatype:");
        textPresent("Number");
    }
}