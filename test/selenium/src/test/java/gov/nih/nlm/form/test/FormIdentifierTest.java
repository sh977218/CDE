package gov.nih.nlm.form.test;

import gov.nih.nlm.common.test.CommonTest;

public class FormIdentifierTest extends CommonTest {
    
    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name);
    }
    
    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }

}
