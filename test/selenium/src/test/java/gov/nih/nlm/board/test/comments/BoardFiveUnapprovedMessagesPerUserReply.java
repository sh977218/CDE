package gov.nih.nlm.board.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class BoardFiveUnapprovedMessagesPerUserReply extends NlmCdeBaseTest {


    @Test
    public void boardFiveUnapprovedMessagesPerUserReplyTest() {
        String boardName = "Depression";
        String reply = "This reply will never be seen.";
        mustBeLoggedInAs(unapprovedMessage_username, password);
        goToBoard(boardName);
        goToDiscussArea();
        findElement(By.id("newReplyTextArea_0")).sendKeys(reply);
        hangon(1);
        clickElement(By.id("replyBtn_0"));
        textNotPresent(reply);
        checkAlert("You have too many unapproved messages.");
    }


}
