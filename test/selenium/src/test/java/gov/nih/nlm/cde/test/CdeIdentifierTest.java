package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.common.test.IdentifiersTest;
import org.testng.annotations.Test;

public class CdeIdentifierTest extends IdentifiersTest {
    
    @Test
    public void addRemoveCdeId() {
        addRemoveId("Intravesical Protocol Agent Administered Specify");
    }
    
    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name, status);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }
    
    
}
