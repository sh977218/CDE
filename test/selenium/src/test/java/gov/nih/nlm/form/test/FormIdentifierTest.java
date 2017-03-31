package gov.nih.nlm.form.test;

import gov.nih.nlm.common.test.IdentifiersTest;
import org.testng.annotations.Test;

public class FormIdentifierTest extends IdentifiersTest {
    
    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name);
    }
    
    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }
    
    @Test
    public void addRemoveFormId() {
        addRemoveId("Vision Deficit Report", "Recorded");
    }
    
    
}
