package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.common.test.IdentifiersTest;
import org.testng.annotations.Test;

public class FormIdentifierTest extends IdentifiersTest {
    
    @Override
    public void goToEltByName(String name) {
        goToFormByName(name);
    }
    
    @Test
    public void addRemoveFormId() {
        addRemoveId("Vision Deficit Report");
    }
    
    
}
