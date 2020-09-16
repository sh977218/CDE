package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeAddCommentNeedApproval extends NlmCdeBaseTest {

    @Test
    public void cdeAddCommentNeedApproval() {
        String cdeName = "Imaging phase encode direction text";
        String commentText = "A Very Innocent Comment.";
        mustBeLoggedInAs(anonymousCommentUser1_username, password);
        goToCdeByName(cdeName);
        goToDiscussArea();
        addCommentNeedApproval(commentText + 1);
        approveComment(commentEditor_username, password, anonymousCommentUser1_username, commentText + 1);

        mustBeLoggedInAs(anonymousCommentUser1_username, password);
        goToCdeByName(cdeName);
        goToDiscussArea();
        addCommentNeedApproval(commentText + 2);
        authorizeComment(commentEditor_username, password, anonymousCommentUser1_username, commentText + 2);

        mustBeLoggedInAs(anonymousCommentUser1_username, password);
        goToCdeByName(cdeName);
        goToDiscussArea();
        findElement(By.name("newCommentTextArea")).sendKeys(commentText + 3);
        hangon(2);
        clickElement(By.id("commentBtn"));
        textPresent(commentText + 3);
        textNotPresent("This comment is pending approval");
    }
}
