package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormRemoveComment extends NlmCdeBaseTest {

    @Test
    public void formRemoveCommentTest() {
        String formName = "Bowel Control Scale (BWCS)";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        removeComment("This comment needs to be removed.");
    }

}
