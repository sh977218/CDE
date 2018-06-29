package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormDeclineComment extends NlmCdeBaseTest {


    @Test()
    public void formDeclineCommentTest() {
        String formName = "ALS Depression Inventory (ADI-12)";
        String sensorComment = "This comment is pending approval";
        goToFormByName(formName);
        goToDiscussArea();
        isCommentOrReplyExists(sensorComment, true);
        declineComment(commentEditor_username, commentEditor_password, anonymousCommentUser2_username, "Bad Comment");

        mustBeLoggedInAs(anonymousCommentUser2_username, anonymousCommentUser_password);
        goToFormByName(formName);
        isCommentOrReplyExists(sensorComment, false);
    }

}
