package gov.nih.nlm.board.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardCannotReplyUnapprovedComment extends NlmCdeBaseTest {

    @Test()
    public void boardCannotReplyUnapprovedComment() {
        String boardName = "Stomach Cancer";
        mustBeLoggedInAs(test_username, password);
        goToBoard(boardName);
        goToDiscussArea();
        textPresent("This comment is pending approval");
        Assert.assertEquals(0, findElements(By.xpath("//*[contains(@id,'replyBtn_')]")).size());
    }
}
