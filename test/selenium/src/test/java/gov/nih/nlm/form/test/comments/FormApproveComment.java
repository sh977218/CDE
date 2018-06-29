package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormApproveComment extends NlmCdeBaseTest {

    @Test
    public void formApproveCommentTest() {
        String formName = "Vital Signs and Tests";
        String commentText = "This comment about Vital Signs and Tests can not be seen unless it is approved.";
        goToFormByName(formName);
        goToDiscussArea();
        textNotPresent(commentText);
        approveComment(commentEditor_username, commentEditor_password, anonymousCommentUser2_username, "This comment can not be seen unless it is approved.");

        mustBeLoggedInAs(anonymousCommentUser2_username, anonymousCommentUser_password);
        goToFormByName(formName);
        textPresent(commentText);
    }

}
