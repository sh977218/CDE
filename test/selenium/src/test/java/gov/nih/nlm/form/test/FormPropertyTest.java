package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.common.test.PropertyTest;
import org.testng.annotations.Test;

public class FormPropertyTest extends PropertyTest {
 
    @Override
    public void goToEltByName(String name) {
        goToFormByName(name);
    }

    @Test
    public void addRemoveCdeProperty() {
        addRemoveProperty("Diabetes - Adverse Event - Patient Report");
    }
    
    @Test
    public void richPropText() {
        richText("Diabetes - Adverse Event - Patient Report");
    }
    
}
