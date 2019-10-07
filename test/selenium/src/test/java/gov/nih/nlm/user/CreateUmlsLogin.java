package gov.nih.nlm.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CreateUmlsLogin extends NlmCdeBaseTest {

    @Test
    public void createUmlsLogin() {
        mustBeLoggedInAs(Umls_not_in_db_username, Umls_not_in_db_password);
    }


}
