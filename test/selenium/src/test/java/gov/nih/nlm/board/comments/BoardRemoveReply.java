package gov.nih.nlm.board.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class BoardRemoveReply extends NlmCdeBaseTest {

    @Test
    public void boardRemoveReplyTest() {
        String boardName = "Hypertension";
        mustBeLoggedInAs(boardUser_username, password);
        goToBoard(boardName);
        removeReply("This is an inappropriate reply");
    }

}
