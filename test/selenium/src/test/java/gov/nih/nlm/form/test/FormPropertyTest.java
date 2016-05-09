package gov.nih.nlm.form.test;

import gov.nih.nlm.common.test.PropertyTest;
import gov.nih.nlm.system.RecordVideo;
import org.testng.annotations.Test;

public class FormPropertyTest extends PropertyTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name);
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
    @RecordVideo
    public void addRemoveFormProperty() {
        addRemoveProperty("Form Property Test", "Recorded");
    }

    @Test
    public void richPropText() {
        mustBeLoggedInAs(testAdmin_username, password);
        richText("Form Rich Text Property Test", "Recorded");
    }

    @Test
    public void reorderProperties() {
        reorderPropertyTest("form for test cde reorder detail tabs");
    }

}
