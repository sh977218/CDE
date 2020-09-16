package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeApproveReply extends NlmCdeBaseTest {
    @Test
    public void cdeApproveReplyTest() {
        String cdeName = "In the past 7 days, when I was in pain I asked for medicine";
        String commentText = "This reply about In the past 7 days, when I was in pain I asked for medicine can not be seen unless it is approved.";
        goToCdeByName(cdeName);
        goToDiscussArea();
        isCommentOrReplyExists(commentText, false);
        approveComment(commentEditor_username, password, anonymousCommentUser2_username, commentText);

        mustBeLoggedInAs(anonymousCommentUser2_username, anonymousCommentUser_password);
        goToCdeByName(cdeName);
        goToDiscussArea();
        isCommentOrReplyExists(commentText, true);
    }
}
