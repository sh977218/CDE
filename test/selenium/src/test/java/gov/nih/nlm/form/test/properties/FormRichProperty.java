package gov.nih.nlm.form.test.properties;

import gov.nih.nlm.form.test.properties.FormPropertyTest;
import org.testng.annotations.Test;

public class FormRichProperty extends FormPropertyTest {

    @Test
    public void richPropText() {
        mustBeLoggedInAs(testAdmin_username, password);
        richText("Form Rich Text Property Test", "Recorded");
    }

}
