package gov.nih.nlm.board.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardCurrentComment extends NlmCdeBaseTest {

//    @Test()
    public void boardCurrentCommentTest() {
        String boardName = "Public Smoking Board";
        goToBoard(boardName);
        goToDiscussArea();
        checkCurrentCommentByIndex(0, true);
    }
}
