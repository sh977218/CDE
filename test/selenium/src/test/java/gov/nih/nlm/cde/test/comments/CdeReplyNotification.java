package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
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

    @Test
    public void updateNotificationView() {
        mustBeLoggedInAs(reguser_username, password);

        clickElement(By.cssSelector("cde-notifications"));
        WebElement taskItem = findElement(By.cssSelector(".notificationDrawerContent div.taskItem"));
        Assert.assertEquals(taskItem.getCssValue("background-color"), "rgb(209, 236, 241)");

        clickElement(By.cssSelector("div.taskItem"));
        textPresent("Cigarette Average Daily Pack Use Count");

        clickElement(By.cssSelector("cde-notifications"));
        taskItem = findElement(By.cssSelector(".notificationDrawerContent div.taskItem"));
        Assert.assertEquals(taskItem.getCssValue("background-color"), "rgb(255, 255, 255)");
    }

}
