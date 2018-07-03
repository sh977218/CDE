package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormDeclineComment extends NlmCdeBaseTest {
    @Test()
    public void formDeclineCommentTest() {
        String formName = "ALS Depression Inventory (ADI-12)";
        String sensorComment = "This comment is pending approval";
        String badComment = "This comment about ALS Depression Inventory (ADI-12) is bad";
        goToFormByName(formName);
        goToDiscussArea();
        textPresent(sensorComment);
        declineComment(commentEditor_username, commentEditor_password, anonymousCommentUser2_username, badComment);

        mustBeLoggedInAs(anonymousCommentUser2_username, anonymousCommentUser_password);
        goToFormByName(formName);
        goToDiscussArea();
        textNotPresent(sensorComment);
    }
}
