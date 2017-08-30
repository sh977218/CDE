package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.test.comments.CdeCommentTest;
import org.testng.annotations.Test;

public class ApproveCommentsCdeTest extends CdeCommentTest {
    @Test
    public void approveCdeComments() {
        approveComments("Imaging phase encode direction text", null, "CommentUser");
    }

    @Test(dependsOnMethods = {"approveCdeComments"})
    public void declineComment() {
        declineComment("Alcohol use started age value",  null, anonymousCommentUser2_username);
    }

}
