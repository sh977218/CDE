package gov.nih.nlm.board.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class BoardAddComment extends NlmCdeBaseTest {
    @Test()
    public void boardAddCommentTest() {
        String boardName = "Num Of Questions Board";
        String commentText = "This comment is about Num Of Questions Board";
        mustBeLoggedInAs(test_username, password);
        goToBoard(boardName);
        goToDiscussArea();
        addComment(commentText);
    }
}
