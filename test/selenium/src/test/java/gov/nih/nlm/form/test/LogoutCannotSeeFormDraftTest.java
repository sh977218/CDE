package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class LogoutCannotSeeFormDraftTest extends NlmCdeBaseTest {
    @Test
    public void logoutCannotSeeFormDraft() {
        String formName = "Draft Form Test";
        mustBeLoggedOut();
        goToFormByName(formName);
        textNotPresent("Delete Draft");
    }

}
