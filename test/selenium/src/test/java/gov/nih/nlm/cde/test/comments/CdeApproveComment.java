package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeApproveComment extends NlmCdeBaseTest {
    @Test
    public void cdeApproveCommentTest() {
        String cdeName = "Person Birth Date";
        String commentText= "This comment about Person Birth Date can not be seen unless it is approved.";
        goToCdeByName(cdeName);
        goToDiscussArea();
        textNotPresent(commentText);
        approveComment(commentEditor_username, commentEditor_password, anonymousCommentUser2_username, "This comment can not be seen unless it is approved.");

        mustBeLoggedInAs(anonymousCommentUser2_username, anonymousCommentUser_password);
        goToCdeByName(cdeName);
        textPresent(commentText);
    }
}
