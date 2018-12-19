package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class CdeReplyNotification extends NlmCdeBaseTest {

    @Test
    public void cdeReplyNotificationTest() {
        String cdeName = "Milestone currently able indicator";
        String replyText = "This reply will trigger notification.";
        mustBeLoggedInAs(reguser_username, password);
        goToCdeByName(cdeName);
        replyCommentNeedApproval(0, replyText);

        logout();
        mustBeLoggedInAs(commentEditor_username, password);
        declineComment(commentEditor_username, password, reguser_username, replyText);
    }

}
