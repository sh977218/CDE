package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeApproveComment extends NlmCdeBaseTest {
    @Test
    public void cdeApproveCommentTest() {
        String cdeName = "Person Birth Date";
        goToCdeByName(cdeName);
        goToDiscussArea();
        textNotPresent("This comment can not be seen unless it is approved.");
        approveComment(commentEditor_username, commentEditor_password, anonymousCommentUser2_username, "This comment can not be seen unless it is approved.");

        mustBeLoggedInAs(anonymousCommentUser2_username, anonymousCommentUser_password);
        goToCdeByName(cdeName);
        textPresent("This comment can not be seen unless it is approved.");
    }
}
