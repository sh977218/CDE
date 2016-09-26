package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class RememberPageLoginTest extends NlmCdeBaseTest {

    @Test
    public void rememberLoginPage() {
        mustBeLoggedOut();
        goToCdeByName("Intracranial procedure type other text");
        textPresent("Specify in text for the intracranial procedure type if it is not listed above");
        doLogin(ninds_username, password);
        textPresent("Specify in text for the intracranial procedure type if it is not listed above");
    }

}
