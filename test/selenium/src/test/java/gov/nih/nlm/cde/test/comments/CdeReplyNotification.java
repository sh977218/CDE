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
        mustBeLoggedInAs(test_username, password);
        clickElement(By.id("incomingMessage"));
        textPresent("Comment reply | reguser | This reply will trigger");
        clickElement(By.partialLinkText("Comment reply | reguser | This reply will trigger"));
        clickElement(By.xpath("//button[normalize-space(.)='Archive']"));
        checkAlert("Message moved to archived.");
    }

}
