package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormAddCommentNeedApproval extends NlmCdeBaseTest {

    @Test
    public void formAddCommentNeedApproval() {
        String formName = "Adverse Event Tracking Log";
        String commentText = "A Very Innocent Comment.";
        mustBeLoggedInAs(anonymousCommentUser2_username, password);
        goToFormByName(formName);
        goToDiscussArea();
        addCommentNeedApproval(commentText);
    }
}
