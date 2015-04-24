package gov.nih.nlm.cde.test;

import org.testng.annotations.Test;

public class ApproveCommentsCdeTest extends CdeCommentTest {
    @Test
    public void approvingCommentsCde() {
        approvingComments("Imaging phase encode direction text", null, anonymousCommentUser_username);
    }

    @Test(dependsOnMethods = {"approvingCommentsCde"})
    public void declineComment() {
        declineComment("Alcohol use started age value",  null, anonymousCommentUser2_username);
    }

}
