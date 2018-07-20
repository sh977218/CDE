package gov.nih.nlm.board.comments;

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
        Assert.assertEquals(driver.findElements(By.xpath("//*[contains(@id,'replyBtn_')]")).size(), 0);
    }
}
