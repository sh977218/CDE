package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormRemoveReply extends NlmCdeBaseTest {

    @Test
    public void formRemoveReplyTest() {
        String formName = "PROMIS SF v2.0 - Emotional Support 8a";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        removeReply("This reply need to be removed");
    }

}
