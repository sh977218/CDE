package gov.nih.nlm.form.test;

import gov.nih.nlm.common.test.PropertyTest;
import org.testng.annotations.Test;

public class FormPropertyTest extends PropertyTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name, status);
    }

    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }

    @Test
    public void autocomplete() {
        autocomplete("Skin Cancer Patient", "autoc", "Autocomplete");
    }

    @Test
    public void addRemoveFormProperty() {
        addRemoveProperty("Form Property Test", "Recorded");
    }

    @Test
    public void richPropText() {
        mustBeLoggedInAs("testUser", password);
        richText("Form Rich Text Property Test", "Recorded");
    }


    @Test
    public void reorderProperties() {
        reorderPropertyTest("form for test cde reorder detail tabs");
    }

}
