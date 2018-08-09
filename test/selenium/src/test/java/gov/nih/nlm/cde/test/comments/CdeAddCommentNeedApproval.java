package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeAddCommentNeedApproval extends NlmCdeBaseTest {

    @Test
    public void cdeAddCommentNeedApproval() {
        String cdeName = "Imaging phase encode direction text";
        String commentText = "A Very Innocent Comment.";
        mustBeLoggedInAs(anonymousCommentUser2_username, password);
        goToCdeByName(cdeName);
        addCommentNeedApproval(commentText);
    }
}
