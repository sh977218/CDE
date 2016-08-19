package gov.nih.nlm.form.test.properties;

import org.testng.annotations.Test;

public class FormPropertyAutocomplete extends FormPropertyTest {

    @Test
    public void autocomplete() {
        autocomplete("Skin Cancer Patient", "autoc", "Autocomplete");
    }

}
