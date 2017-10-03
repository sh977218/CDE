package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class LogoutCannotSeeDraftTest extends NlmCdeBaseTest {
    @Test
    public void logoutCannotSeeDraft() {
        String formName = "Draft Form Test";
        mustBeLoggedOut();
        goToFormByName(formName);
        textNotPresent("Delete Draft");
    }

}
