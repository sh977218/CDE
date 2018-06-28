package gov.nih.nlm.board.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardNoticedComment extends NlmCdeBaseTest {
    @Test()
    public void boardNoticedCommentTest() {
        String boardName = "Num Of Questions Board";
        goToBoard(boardName);
        Assert.assertEquals(driver.findElements(By.cssSelector(".faa-wrench")).size(), 0);
    }
}
