package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeApproveComment extends NlmCdeBaseTest {
    @Test
    public void cdeApproveCommentTest() {
        String cdeName = "Person Birth Date";
        String commentText = "This comment about Person Birth Date can not be seen unless it is approved.";
        goToCdeByName(cdeName);
        goToDiscussArea();
        textNotPresent(commentText, By.xpath("//cde-comments"));
        approveComment(commentEditor_username, commentEditor_password, anonymousCommentUser2_username, commentText);

        mustBeLoggedInAs(anonymousCommentUser2_username, anonymousCommentUser_password);
        goToCdeByName(cdeName);
        textPresent(commentText, By.xpath("//cde-comments"));
    }
}
