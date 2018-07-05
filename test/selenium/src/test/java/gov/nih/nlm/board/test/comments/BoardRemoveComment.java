package gov.nih.nlm.board.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class BoardRemoveComment extends NlmCdeBaseTest {

    @Test
    public void boardRemoveCommentTest() {
        String boardName = "Plantar Fibromatosis";
        mustBeLoggedInAs(boardUser_username, password);
        goToBoard(boardName);
        removeComment("This is an inappropriate comment");
        textNotPresent("I am a good reply to a bad comment");
    }

}
