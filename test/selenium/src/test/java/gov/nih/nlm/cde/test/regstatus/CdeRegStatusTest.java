package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.cde.common.test.RegStatusTest;


public class CdeRegStatusTest extends RegStatusTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name, status);
    }
    
    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }
    
}
