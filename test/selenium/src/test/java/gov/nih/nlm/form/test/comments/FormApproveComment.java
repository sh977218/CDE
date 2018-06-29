package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormApproveComment extends NlmCdeBaseTest {

    @Test
    public void formApproveCommentTest() {
        String formName = "Vital Signs and Tests";
        String commentText = "This comment about Vital Signs and Tests can not be seen unless it is approved.";
        goToFormByName(formName);
        goToDiscussArea();
        isCommentExists(commentText, false);
        approveComment(commentEditor_username, commentEditor_password, anonymousCommentUser2_username, commentText);

        mustBeLoggedInAs(anonymousCommentUser2_username, anonymousCommentUser_password);
        goToFormByName(formName);
        isCommentExists(commentText, true);
    }

}
