package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class PinWhenNotLoggedIn extends NlmCdeBaseTest {

    @Test
    public void pinWhenNotLoggedIn() {
        mustBeLoggedOut();
        
    }

}
