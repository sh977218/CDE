package gov.nih.nlm.cde.test.comments;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class ReplyNotification extends CdeCommentTest {

    @Test
    public void replyNotification() {
        mustBeLoggedInAs(test_username, password);

        String eltName = "Milestone currently able indicator";
        int randomNumber = getRandomNumber();
        String commentText = "Comment with reply " + randomNumber;
        String replyText = "Reply will trigger notification " + randomNumber;

        goToEltByName(eltName);
        addComment(commentText);

        logout();
        mustBeLoggedInAs(reguser_username, password);
        goToEltByName(eltName);

        clickElement(By.id("discussBtn"));
        wait.until(ExpectedConditions.elementToBeClickable(By.id("newReplyTextArea_0")));
        findElement(By.id("newReplyTextArea_0")).sendKeys(replyText);
        hangon(1);
        scrollToViewById("replyBtn_0");
        clickElement(By.id("replyBtn_0"));

        logout();
        mustBeLoggedInAs(test_username, password);
        clickElement(By.id("incomingMessage"));

        textPresent("Comment reply | reguser | Reply will trigger");
        clickElement(By.partialLinkText("Comment reply | reguser | Reply will trigger"));
        clickElement(By.xpath("//button[normalize-space(.)='Archive']"));
        checkAlert("Message moved to archived.");
    }

}
