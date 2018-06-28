package gov.nih.nlm.board.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardCurrentComment extends NlmCdeBaseTest {

    @Test()
    public void boardCurrentCommentTest() {
        String boardName = "Public Smoking Board";
        goToBoard(boardName);
        goToDiscussArea();
        Assert.assertEquals(true, findElement(By.id("currentComment_0")).getAttribute("class").contains("currentComment"));
    }
}
