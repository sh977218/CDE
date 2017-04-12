package gov.nih.nlm.form.test;

import gov.nih.nlm.common.test.IdentifiersTest;

public class FormIdentifierTest extends IdentifiersTest {
    
    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name);
    }
    
    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }

}
