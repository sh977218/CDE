package gov.nih.nlm.board.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardNoticedComment extends NlmCdeBaseTest {
    @Test()
    public void boardNoticedCommentTest() {
        String boardName = "Stomach Cancer";
        mustBeLoggedInAs(test_username, password);
        goToBoard(boardName);
        Assert.assertEquals(driver.findElements(By.cssSelector(".faa-wrench")).size(), 0);
    }
}
