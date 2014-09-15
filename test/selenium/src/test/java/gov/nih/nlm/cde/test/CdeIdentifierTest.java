package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.common.test.IdentifiersTest;
import org.testng.annotations.Test;

public class CdeIdentifierTest extends IdentifiersTest {
    
    @Override
    public void goToEltByName(String name) {
        goToCdeByName(name);
    }
    
    @Test
    public void addRemoveCdeId() {
        addRemoveId("Intravesical Protocol Agent Administered Specify");
    }
    
}
