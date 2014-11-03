package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.common.test.PropertyTest;
import org.testng.annotations.Test;

public class FormPropertyTest extends PropertyTest {
 
    @Override
    public void goToEltByName(String name) {
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
    public void addRemoveFormProperty() {
        addRemoveProperty("Form Property Test");
    }
    
    @Test
    public void richPropText() {
        richText("Form Rich Text Property Test");
    }
    
}
