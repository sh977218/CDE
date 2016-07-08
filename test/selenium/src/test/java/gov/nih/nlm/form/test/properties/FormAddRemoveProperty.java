package gov.nih.nlm.form.test.properties;

import org.testng.annotations.Test;

public class FormAddRemoveProperty extends FormPropertyTest {

    @Test
    public void addRemoveFormProperty() {
        addRemoveProperty("Form Property Test", "Recorded");
    }

}
