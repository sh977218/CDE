package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class DeleteDraftTest extends NlmCdeBaseTest {
    @Test
    public void deleteDraft() {
        String formName = "";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);

    }
}
