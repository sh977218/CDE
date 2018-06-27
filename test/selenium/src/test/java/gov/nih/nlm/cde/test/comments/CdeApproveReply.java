package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeApproveReply extends NlmCdeBaseTest {

    @Test
    public void cdeApproveReply() {
        String cdeName = "Lower limb tone findings result";
        int randomNumber = getRandomNumber();
        String commentText = "Top Level Comment " + randomNumber;
        String replyText = "Very Innocent Reply " + randomNumber;
        mustBeLoggedInAs(reguser_username, anonymousCommentUser_password);
        goToCdeByName(cdeName);
        addCommentNeedApproval(commentText);
        approveComment(reguser_username, commentText);

        mustBeLoggedInAs(reguser_username, anonymousCommentUser_password);
        goToCdeByName(cdeName);
        replyComment(0, replyText);

        logout();
        goToCdeByName(cdeName);
        clickElement(By.id("discussBtn"));
        textPresent(commentText);
        textPresent(replyText);
    }

}
