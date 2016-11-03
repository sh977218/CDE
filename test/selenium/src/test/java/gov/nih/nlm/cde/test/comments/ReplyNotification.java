package gov.nih.nlm.cde.test.comments;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ReplyNotification extends CdeCommentTest {

    @Test
    public void replyNotification() {
        mustBeLoggedInAs(test_username, password);

        String eltName = "Milestone currently able indicator";
        int randomNumber = (int)(Math.random() * 10000);
        String commentText = "Comment with reply " + randomNumber;
        String replyText = "Reply will trigger notification " + randomNumber;

        goToEltByName(eltName);
        addComment(commentText);

        mustBeLoggedInAs(reguser_username, password);
        goToEltByName(eltName);

        clickElement(By.id("discussBtn"));
        findElement(By.id("replyTextarea_0")).sendKeys(replyText);
        hangon(2);
        clickElement(By.id("replyBtn_0"));
        textPresent("Reply added");
        closeAlert();

        mustBeLoggedInAs(test_username, password);
        clickElement(By.id("incomingMessage"));

        textPresent("comment reply | reguser | Reply will trigger");
        clickElement(By.xpath("//span[contains(., 'comment reply | reguser | Reply will trigger')]"));
        clickElement(By.xpath("//button[.='Archive']"));
        textPresent("Message moved to archived.");
        closeAlert();
    }

}
